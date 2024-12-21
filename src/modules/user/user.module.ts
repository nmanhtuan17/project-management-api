import { DbModule } from "@/base/db";
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { ConfigService } from "@nestjs/config";
import { CloudinaryService } from "@/base/services/cloudinary.service";

@Module({
  imports: [
    DbModule,
    // StorageModule
  ],
  providers: [UserService, ConfigService, CloudinaryService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule{}