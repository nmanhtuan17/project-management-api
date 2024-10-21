import { DbModule } from "@/base/db";
import { Module } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { DbService } from "@/base/db/services";
import { ProjectController } from "./project.controller";

@Module({
  imports: [
    DbModule
  ],
  providers: [
    ProjectService
  ],
  controllers: [ProjectController]
})
export class ProjectModule{}