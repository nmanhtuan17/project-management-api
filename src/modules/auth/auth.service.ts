import { User } from "@/base/db";
import { DbService } from "@/base/db/services";
import { randomString } from "@/common/utils";
import { Injectable } from "@nestjs/common";
import { MailService } from "../../mail/mail.service";

@Injectable()
export class AuthService {
  constructor(
    private db: DbService,
    private mail: MailService
  ) {

  }

  login () {
    return 'Login successfully';
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
    await this.mail.sendUserVerification(user, verificationCode);
  }
}