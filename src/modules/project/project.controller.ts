import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ReqUser } from "@/common/decorators/req-user.decorator";
import { AuthPayload } from "../auth/dto/auth.dto";
import { CreateColumnDto, CreateProjectDto, VerifySlugDto } from "./dto/project.dto";
import { DbService } from "@/base/db/services";
import { Messages } from "@/base/config";
import { ProjectRoles } from "@/common/types/project";
import { HttpError } from "postmark/dist/client/errors/Errors";
import { ProjectManagerOrAboveRequired, ProjectOwnerRequired } from "./decorators/project.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "@/base/services";

@Controller('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    private project: ProjectService,
    private db: DbService,
    private storageService: StorageService
  ) {
  }

  @Get('/')
  async getProjects(
    @ReqUser() user: AuthPayload
  ) {
    return await this.project.getAll(user)
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
    @ReqUser() user: AuthPayload
  ) {
    const project = await this.project.createProject(payload)
    await this.project.addMember(project._id.toString(), user.userId, ProjectRoles.OWNER)
    await this.project.createBoard(project._id.toString())
    return {
      data: project,
      message: Messages.project.projectCreated,
      status: HttpStatus.CREATED
    }
  }

  @Post('/slug')
  async verifySlug(
    @Body() payload: VerifySlugDto
  ) {
    const slug = await this.db.project.findOne({ slug: payload.slug })
    if (slug) throw new HttpException(Messages.project.slugExists, HttpStatus.CONFLICT)
    return {
      message: 'SLUG_VERIFIED',
      status: HttpStatus.OK
    }
  }

  @Get('/:projectId/board')
  async getProjectBoard(
    @Param('projectId') projectId: string
  ) {
    const projectBoard = await this.db.projectBoard.find({ project: projectId }).populate('columns')
    if (!projectBoard) throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND)
    return {
      data: projectBoard,
      message: 'SUCCESS',
      status: HttpStatus.OK
    }
  }

  @Post('/:projectId/column')
  @ProjectManagerOrAboveRequired()
  async createColumn(
    @Param('projectId') projectId: string,
    @Body() payload: CreateColumnDto
  ) {
    const board = await this.project.createColumn(projectId, payload)
    if (!board) throw new HttpException("CREATE_FAILED", HttpStatus.BAD_REQUEST)
    return {
      data: board,
      message: 'COLUMN_UPDATED',
      status: HttpStatus.CREATED
    }
  }

  @Put('/:projectId/column/:columnId')
  @ProjectManagerOrAboveRequired()
  async updateColumn(
    @Param('projectId') projectId: string,
    @Param('columnId') columnId: string,
    @Body() payload: CreateColumnDto
  ) {
    const update = await this.project.updateColumn(columnId, payload)
    if (!update) throw new HttpException("COLUMN_NOT_FOUND", HttpStatus.NOT_FOUND)
    return {
      message: 'COLUMN_UPDATED',
      status: HttpStatus.OK
    }
  }
  @Delete('/:projectId/column/:columnId')
  @ProjectManagerOrAboveRequired()
  async deteteColumn(
    @Param('projectId') projectId: string,
    @Param('columnId') columnId: string,
  ) {
    try {
      await this.project.deleteColumn(columnId);
      return {
        message: 'COLUMN_UPDATED',
        status: HttpStatus.OK
      }
    } catch (error) {
      throw new HttpException("DELETE_FAIL", HttpStatus.BAD_REQUEST)
    }
  }

  @Post('/:projectId/avatar')
  @ProjectOwnerRequired()
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProjectAvatar(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    const { url } = await this.storageService.uploadAttachmentFile(projectId, file)
    const projectUpdated = await this.project.updateProjectAvatar(projectId, url)

    return {
      data: projectUpdated,
      message: Messages.project.projectUpdated
    }
  }
}