import { DbModule } from "@/base/db";
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";

@Module({
  imports: [
    DbModule
  ],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule{}