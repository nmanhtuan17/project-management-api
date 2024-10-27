import { Body, Controller, Get, HttpStatus, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ReqUser } from "@/common/decorators/req-user.decorator";
import { Payload } from "../auth/dto/auth.dto";
import { CreateProjectDto } from "./dto/project.dto";
import { DbService } from "@/base/db/services";
import { Messages } from "@/base/config";
import { ProjectRoles } from "@/common/types/project";

@Controller('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    private project: ProjectService,
    private db: DbService
  ) {
  }

  @Get('/')
  async getProjects() {
    return await this.project.getAll()
  }
  @Get('/:projectId')
  async getProject(
    @Param('projectId') projectId: string
  ) {
    return this.project.getProject(projectId)
  }

  @Post('/')
  async createProject(
    @Body() payload: CreateProjectDto,
    @ReqUser() user: Payload
  ) {
    console.log(payload)
    console.log(user)
    const project = await this.project.createProject(payload)
    await this.project.addMember(project._id.toString(), user.userId, ProjectRoles.OWNER)

    return {
      data: project,
      message: Messages.project.projectCreated,
      status: HttpStatus.CREATED
    }
  }

}