/**
 * Use this module file to create instances of all authentication and simplify imports in to your routers
 */

import AuthService from '../../../services/Auth.service';
import CreateUser from './CreateUser';
import LoginUser from './LoginUser';
import TokenService from '../../../services/Token.service';
import EncryptionService from '../../../services/Encryption.service';
import PasswordReset from './PasswordReset';
import EmailService from '../../../services/Email.service';
import UserService from '../../../services/User.service';
import VerifyEmailClass from './VerifyUserEmail';

export const createUser = new CreateUser(
  new AuthService(new TokenService()),
  new EncryptionService(),
);
export const loginUser = new LoginUser(
  new AuthService(new TokenService()),
  new UserService(),
  new EncryptionService(),
  new EmailService(),
);
export const verifyEmail = new VerifyEmailClass(new EncryptionService());
export const passwordReset = new PasswordReset(
  new EmailService(),
  new EncryptionService(),
  new UserService(),
  new AuthService(new TokenService()),
);
