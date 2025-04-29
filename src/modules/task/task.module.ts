import { DbModule } from "@/base/db";
import { DbService } from "@/base/db/services";
import { Module } from "@nestjs/common";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { StorageService } from "@/base/services";
import { ProjectModule } from "../project/project.module";
import { NotificationModule } from "@/modules/notification/notification.module";
import { ScheduleModule } from '@nestjs/schedule';
import { TaskScheduler } from './task.scheduler';
import { MailModule } from "../mail/mail.module";
@Module({
  imports: [
    DbModule,
    ProjectModule,
    NotificationModule,
    MailModule,
    ScheduleModule.forRoot()
  ],
  controllers: [TaskController],
  providers: [TaskService, StorageService, TaskScheduler],
  exports: [TaskService]
})
export class TaskModule { }