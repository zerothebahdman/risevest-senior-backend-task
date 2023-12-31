import { NextFunction, Response } from 'express';
import { RequestType } from '../middlewares/auth.middleware';
import httpStatus from 'http-status';
import AppException from '../../exceptions/AppException';
import UserService from '../../services/User.service';
import pick from '../../utils/pick';
import { User } from '@prisma/client';

export default class UserController {
  constructor(private readonly userService: UserService) {}
  async getAllUsers(req: RequestType, res: Response, next: NextFunction) {
    try {
      const options = pick(req.query, ['limit', 'page', 'orderBy', 'populate']);
      const users = await this.userService.getAllUsers({}, options);
      return res.status(httpStatus.OK).json({ status: 'success', users });
    } catch (err) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async getSingleUser(_req: RequestType, res: Response, next: NextFunction) {
    try {
      const user = (await this.userService.getAllUsers({}, {}, true)) as User[];
      return res.status(httpStatus.OK).json({
        status: 'success',
        user: user[0],
      });
    } catch (err: unknown) {
      if (err instanceof Error)
        return next(new AppException(err.message, httpStatus.BAD_REQUEST));
    }
  }
}
