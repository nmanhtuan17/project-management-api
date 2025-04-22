import { DbModule } from "@/base/db";
import { NotificationController } from "@/modules/notification/notification.controller";
import { NotificationService } from "@/modules/notification/notification.service";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    DbModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, ConfigService],
  exports: [NotificationService]

})
export class NotificationModule {
}