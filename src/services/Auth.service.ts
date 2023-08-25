import TokenService from './Token.service';
import { User } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import prisma from '../index.prisma';

export default class AuthService {
  constructor(private readonly tokenService: TokenService) {}

  async createUser(createBody: User, token: string) {
    const user = await prisma.user.create({
      data: {
        ...createBody,
        EmailVerification: {
          create: {
            token,
          },
        },
      },
    });
    return user;
  }

  async loginUser(loginPayload: User) {
    const token = await this.tokenService.generateToken(
      loginPayload.id,
      loginPayload.first_name,
    );

    return token;
  }

  async regenerateAccessToken(refreshToken: string): Promise<string> {
    const decodeToken = await new TokenService().verifyToken(refreshToken);
    const { sub }: string | JwtPayload = decodeToken;
    const user = await prisma.user.findUnique({ where: { id: sub as string } });

    if (!user) throw new Error(`Oops!, user with id ${sub} does not exist`);

    const { accessToken } = await this.tokenService.generateToken(
      user.id,
      user.email,
    );

    return accessToken;
  }

  async resendOtp(actor: User, token: string): Promise<void> {
    // delete old email verification tokens if exist
    const deletePrevEmailVerificationIfExist =
      prisma.emailVerification.deleteMany({
        where: { user_id: actor.id },
      });

    const createEmailVerification = prisma.emailVerification.create({
      data: {
        user_id: actor.id,
        token,
      },
      select: null,
    });

    await prisma.$transaction([
      deletePrevEmailVerificationIfExist,
      createEmailVerification,
    ]);
  }

  async initiateResetPassword(user: User, token: string): Promise<void> {
    const deletePrevPasswordResetIfExist = prisma.passwordReset.deleteMany({
      where: { user_id: user.id },
    });

    const createPasswordReset = prisma.passwordReset.create({
      data: {
        user_id: user.id,
        token,
      },
      select: null,
    });

    await prisma.$transaction([
      deletePrevPasswordResetIfExist,
      createPasswordReset,
    ]);
  }
}
