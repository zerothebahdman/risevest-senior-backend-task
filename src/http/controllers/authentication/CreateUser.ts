import { Request, Response, NextFunction } from 'express';
import AppException from '../../../exceptions/AppException';
import EmailService from '../../../services/Email.service';
import httpStatus from 'http-status';
import prisma from '../../../database/model.module';
import AuthService from '../../../services/Auth.service';
import EncryptionService from '../../../services/Encryption.service';
import HelperClass from '../../../utils/helper';
import config from '../../../../config/default';
const emailService = new EmailService();

export default class CreateUser {
  constructor(
    private readonly authService: AuthService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const emailTaken = await prisma.user.findUnique({
        where: { email: req.body.email },
      });
      if (emailTaken) throw new Error(`Oops!, ${emailTaken.email} is taken`);

      req.body.password = await this.encryptionService.hashPassword(
        req.body.password,
      );
      const token = HelperClass.generateRandomChar(6, 'num');
      const hashedToken = await this.encryptionService.hashString(token);
      delete req.body.confirmPassword;
      const user = await this.authService.createUser(req.body, hashedToken);
      /** Send email verification to user */
      if (config.env === 'production') {
        await emailService._sendUserEmailVerificationEmail(
          user.first_name,
          user.email,
          token,
        );
      }

      return res.status(httpStatus.CREATED).json({
        status: 'success',
        message: `We've sent an verification email to your mail`,
        user,
      });
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }
}
