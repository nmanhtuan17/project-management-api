import { DbModule } from "@/base/db";
import { Module } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { DbService } from "@/base/db/services";
import { ProjectController } from "./project.controller";
import { ProjectMemberController } from "./project-member.controller";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [
    DbModule,
    MailModule
  ],
  providers: [
    ProjectService
  ],
  controllers: [ProjectController, ProjectMemberController],
  exports: [ProjectService]
})
export class ProjectModule{}