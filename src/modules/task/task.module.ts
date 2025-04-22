import { DbModule } from "@/base/db";
import { DbService } from "@/base/db/services";
import { Module } from "@nestjs/common";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { StorageService } from "@/base/services";
import { ProjectModule } from "../project/project.module";
import { NotificationModule } from "@/modules/notification/notification.module";

@Module({
  imports: [
    DbModule,
    ProjectModule,
    NotificationModule
  ],
  controllers: [TaskController],
  providers: [TaskService, StorageService],
  exports: [TaskService]
})
export class TaskModule { }