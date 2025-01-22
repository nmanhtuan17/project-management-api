import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailController } from "./mail.controller";
import { DbModule } from "@/base/db";
import { StorageService } from "@/base/services";

@Module({
  imports: [DbModule],
  providers: [MailService, StorageService],
  controllers: [MailController],
  exports: [MailService]
})
export class MailModule {
  
}