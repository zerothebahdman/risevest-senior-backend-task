/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { TokenMustStillBeValid } from './rules/rules.module';
import AppException from '../../../exceptions/AppException';
import moment from 'moment';
import prisma from '../../../database/model.module';
import httpStatus from 'http-status';
import EncryptionService from '../../../services/Encryption.service';

export default class VerifyEmailClass {
  constructor(private readonly encryptionService: EncryptionService) {}
  async execute(req: Request, res: Response, next: NextFunction) {
    try {
      /**
       * Check if the hashed token sent to the email_verification has not being tampered with
       * Check if the token is the same with the one stores in the database
       * check if the email has not being verified
       * check if the token has expired
       * set email_verification_token and email_verification_token_expiry field to null
       */

      const _hashedEmailToken: string = await this.encryptionService.hashString(
        req.body.otp,
      );

      const email_verification = await prisma.emailVerification.findFirst({
        where: {
          token: _hashedEmailToken,
        },
      });

      if (!email_verification) return TokenMustStillBeValid(next);
      if (email_verification.validUntil < moment().utc().toDate())
        throw new Error(`Oops!, your token has expired`);

      return res.status(httpStatus.OK).json({
        status: `success`,
        message: `Your email has been verified`,
      });
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }
}
