import { NextFunction, Request, Response } from 'express';
import AppException from '../../../exceptions/AppException';
import httpStatus from 'http-status';
import AuthService from '../../../services/Auth.service';
import UserService from '../../../services/User.service';
import EncryptionService from '../../../services/Encryption.service';
import HelperClass from '../../../utils/helper';
import { VerificationStatus } from '@prisma/client';
import EmailService from '../../../services/Email.service';

export default class LoginUser {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly encryptionService: EncryptionService,
    private readonly emailService: EmailService,
  ) {}
  async _loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const _userExists = await this.userService.getUserByEmail(req.body.email);

      if (
        !_userExists ||
        !(await this.encryptionService.comparePassword(
          _userExists.password,
          req.body.password,
        ))
      )
        throw new Error(`Oops!, invalid email or password`);

      if (_userExists.verification !== VerificationStatus.verified)
        throw new Error(`Oops!, email has not been verified`);
      const token = await this.authService.loginUser(_userExists);
      return res.status(httpStatus.CREATED).json({
        user: HelperClass.removeUnwantedProperties(_userExists, [
          'password',
          'deleted_at',
        ]),
        token,
      });
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async regenerateAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      const accessToken = await this.authService.regenerateAccessToken(
        req.body.refreshToken,
      );
      if (!accessToken || accessToken.trim() === '')
        return next(
          new AppException(
            'Oops! Refresh token expired.',
            httpStatus.FORBIDDEN,
          ),
        );

      return res.status(httpStatus.OK).json({ status: 'success', accessToken });
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.getUserByEmail(req.body.email);
      if (!user)
        next(
          new AppException('Oops!, user does not exist', httpStatus.NOT_FOUND),
        );
      if (user.verification === VerificationStatus.verified)
        new Error(`Oops!, email has already been verified`);
      const token = HelperClass.generateRandomChar(6, 'num');
      const hashToken = await this.encryptionService.hashString(token);
      await this.authService.resendOtp(user, hashToken);
      await this.emailService._sendUserEmailVerificationEmail(
        user.first_name,
        user.email,
        token,
      );
      return res.status(httpStatus.NO_CONTENT).send();
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }
}
