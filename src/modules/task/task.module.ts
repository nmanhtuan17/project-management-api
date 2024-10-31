import { DbModule } from "@/base/db";
import { DbService } from "@/base/db/services";
import { Module } from "@nestjs/common";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";
import { StorageService } from "@/base/services";

@Module({
  imports: [
    DbModule
  ],
  controllers: [TaskController],
  providers: [TaskService, StorageService],
  exports: [TaskController]
})
export class TaskModule { }