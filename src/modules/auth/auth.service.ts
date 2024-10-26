import { User } from "@/base/db";
import { DbService } from "@/base/db/services";
import { generatePassword, randomString } from "@/common/utils";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { MailService } from "../mail/mail.service";
import { compare, hashSync } from "bcrypt";
import { HydratedDocument } from "mongoose";
import { JwtPayload, JwtSign, Payload } from "@/modules/auth/dto/auth.dto";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as dayjs from "dayjs";

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

  public jwtSign(data: Payload): JwtSign {
    const payload: JwtPayload = {
      sub: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
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
      role: user.role,
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

}
