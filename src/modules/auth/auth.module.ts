import { DbModule } from "@/base/db";
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserModule } from "../user/user.module";
import { MailModule } from "../../mail/mail.module";

@Module({
  imports: [
    DbModule,
    UserModule,
    MailModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {
}