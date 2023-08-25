import { Router, Request, Response, NextFunction } from 'express';
import {
  createUser,
  verifyEmail,
  loginUser,
  passwordReset,
} from '../../controllers/authentication/authentication.module';
import {
  CreateUserValidator,
  forgotPasswordValidator,
  LoginValidator,
  RegenerateAccessToken,
  ResetPasswordValidator,
  verifyUserEmailValidator,
} from '../../../validators/Auth.validation';
import validate from '../../middlewares/validate';
import { resendOtpValidator } from '../../../validators/Auth.validation';
import { userController } from '../../controllers/controllers.module';

const route = Router();

route
  .route('/users')
  .post(validate(CreateUserValidator), (req, res, next) => {
    createUser.createUser(req, res, next);
  })
  .get((req, res, next) => {
    userController.getAllUsers(req, res, next);
  });

route.post(
  '/verify-email',
  validate(verifyUserEmailValidator),
  (req, res, next) => {
    verifyEmail.execute(req, res, next);
  },
);

route.post('/login', validate(LoginValidator), (req, res, next) => {
  loginUser._loginUser(req, res, next);
});

// TODO: implement logout endpoint
// route.get('/logout', (req, res, next) => {});

route.post(
  '/regenerate-access-token',
  validate(RegenerateAccessToken),
  (req, res, next) => {
    loginUser.regenerateAccessToken(req, res, next);
  },
);

route.post('/resend-otp', validate(resendOtpValidator), (req, res, next) => {
  loginUser.resendOtp(req, res, next);
});

route.post(
  '/forgot-password',
  validate(forgotPasswordValidator),
  (req: Request, res: Response, next: NextFunction) => {
    passwordReset.sendResetPasswordEmail(req, res, next);
  },
);

route.post(
  '/reset-password',
  validate(ResetPasswordValidator),
  (req: Request, res: Response, next: NextFunction) => {
    passwordReset.resetPassword(req, res, next);
  },
);

export default route;
