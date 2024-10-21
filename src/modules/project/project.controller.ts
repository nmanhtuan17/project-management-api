import { DbService } from "@/base/db/services";
import { Controller, Get, Inject } from "@nestjs/common";
import { ProjectService } from "./project.service";

@Controller('project')
export class ProjectController {
  constructor(
    private project: ProjectService
  ) {
  }

  @Get()
  getProjects() {
    return this.project.getAll()
  }
}