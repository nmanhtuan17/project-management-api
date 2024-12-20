import { User } from "@/base/db";
import { DbService } from "@/base/db/services";
import { generatePassword, randomString } from "@/common/utils";
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { MailService } from "../mail/mail.service";
import { compare, hashSync } from "bcrypt";
import { HydratedDocument } from "mongoose";
import { JwtPayload, JwtSign, AuthPayload } from "@/modules/auth/dto/auth.dto";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as dayjs from "dayjs";
import { Messages } from "@/base/config";

@Injectable()
export class AuthService {
  constructor(
    private db: DbService,
    private mail: MailService,
    private jwt: JwtService,
    private config: ConfigService
  ) {

  }

  public async validateUser(email: string, password: string): Promise<HydratedDocument<User> | null> {
    const user = await this.db.user.findOne({
      email
    }).select("+password");
    if (!user) return null;
    if (!user.password || user.password === "") throw new HttpException("USER_LOGIN_SSO", HttpStatus.FORBIDDEN);
    const isValidPassword = await compare(password, user.password);
    if (isValidPassword) {
      delete user.password;
      return user;
    }
    return null;
  }

  public jwtSign(data: AuthPayload): JwtSign {
    const payload: JwtPayload = {
      sub: data.userId,
      fullName: data.fullName,
      email: data.email,
      sessionId: data.sessionId,
    };

    return {
      access_token: this.jwt.sign(payload),
      refresh_token: this.getRefreshToken(payload.sub, payload.sessionId)
    };
  }

  public createSession(user: User, platform: string = 'web') {
    return this.db.session.create({
      user: user._id.toString(),
      platform,
      expirationDate: dayjs().add(1, 'd').toDate()
    });
  }

  public signUser(user: User, sessionId: string) {
    return this.jwtSign({
      userId: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      sessionId,
    });
  }

  public async sendVerificationEmail(user: User) {
    let valid = false;
    let verificationCode = randomString().toUpperCase();
    while (!valid) {
      verificationCode = randomString().toUpperCase();
      const found = await this.db.verificationCode.findOne({
        code: verificationCode
      });
      valid = !found;
    }
    await this.db.verificationCode.create({
      user,
      code: verificationCode
    })
    await this.mail.sendUserVerification(user, verificationCode);
  }

  public async sendNewPassword(email: string) {
    const newPassword = generatePassword(8);
    const user = await this.db.user.findOne({ email })
    user.password = hashSync(newPassword, 10);

    await user.save()
    await this.mail.sendResetPassword(user, newPassword)
  }


  private getRefreshToken(sub: string, sessionId: string): string {
    return this.jwt.sign({ sub, sessionId }, {
      secret: this.config.get("auth.jwt.refreshSecret"),
      expiresIn: "7d"
    });
  }

  public validateRefreshToken(data: AuthPayload, refreshToken: string): boolean {
    if (!this.jwt.verify(refreshToken, { secret: this.config.get("auth.jwt.refreshSecret") })) {
      return false;
    }
    const payload = this.jwt.decode<{ sub: string }>(refreshToken);
    return payload.sub === data.userId;
  }

  public async jwtRefresh(refreshToken: string): Promise<JwtSign> {
    const payload = this.jwt.decode(refreshToken);
    const userId = payload.sub;
    const user = await this.db.user.getById(userId);
    if (!user) throw new Error("INVALID_USER");
    const session = await this.db.session.getById(payload.sessionId);
    if (!session) throw new UnauthorizedException(Messages.auth.sessionExpired);
    session.expirationDate = dayjs().add(1, 'd').toDate();
    await session.save();

    return this.jwtSign({
      userId: userId,
      fullName: user.fullName,
      email: user.email,
      sessionId: payload.sessionId,
    });
  }

  public jwtDecode(token: string) {
    return this.jwt.decode(token);
  }

}
