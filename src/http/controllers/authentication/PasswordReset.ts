import { NextFunction, Request, Response } from 'express';
import AppException from '../../../exceptions/AppException';
import EmailService from '../../../services/Email.service';
import TokenMustStillBeValid from './rules/TokenMustStillBeValid';
import moment from 'moment';
import EncryptionService from '../../../services/Encryption.service';
import prisma from '../../../database/model.module';
import UserService from '../../../services/User.service';
import httpStatus from 'http-status';
import HelperClass from '../../../utils/helper';
import AuthService from '../../../services/Auth.service';

export default class PasswordReset {
  constructor(
    private readonly emailService: EmailService,
    private readonly encryptionService: EncryptionService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async sendResetPasswordEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email } = req.body;
      const userExists = await this.userService.getUserByEmail(email);
      if (!userExists)
        return next(
          new AppException('Oops! User does not exist', httpStatus.NOT_FOUND),
        );

      const token = HelperClass.generateRandomChar(6, 'num');
      const hashedToken = await this.encryptionService.hashPassword(token);

      await this.authService.initiateResetPassword(userExists, hashedToken);

      await this.emailService._sendUserPasswordResetInstructionEmail(
        userExists.first_name,
        userExists.email,
        token,
      );

      res.status(httpStatus.OK).send({
        status: 'success',
        message: 'Password reset instruction has been sent to your email',
      });
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const hashedToken = await this.encryptionService.hashString(
        req.body.token,
      );

      const password_reset = await prisma.passwordReset.findFirst({
        where: { token: hashedToken },
      });

      if (!password_reset) return TokenMustStillBeValid(next);
      if (password_reset.validUntil < moment().utc().toDate())
        throw new Error(`Oops!, your token has expired`);
      const hashedPassword = await this.encryptionService.hashPassword(
        req.body.password,
      );

      await this.userService.updateUserById(password_reset.user_id, {
        password: hashedPassword,
      });

      res.status(httpStatus.OK).json({
        status: 'success',
        message: 'Password reset was successful',
      });
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }
}
