import { DbModule } from "@/base/db";
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { ConfigService } from "aws-sdk";

@Module({
  imports: [
    DbModule
  ],
  providers: [UserService, ConfigService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule{}