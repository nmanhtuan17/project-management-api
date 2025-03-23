import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ReqUser } from "@/common/decorators/req-user.decorator";
import { AuthPayload } from "../auth/dto/auth.dto";
import { CreateColumnDto, CreateLabelDto, CreateMilestoneDto, CreateProjectDto, VerifySlugDto } from "./dto/project.dto";
import { DbService } from "@/base/db/services";
import { Messages } from "@/base/config";
import { ProjectRoles } from "@/common/types/project";
import { HttpError } from "postmark/dist/client/errors/Errors";
import { ProjectManagerOrAboveRequired, ProjectOwnerRequired } from "./decorators/project.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "@/base/services";
import { $Command } from "@aws-sdk/client-s3";
import { Column } from "@/base/db";
import * as dayjs from "dayjs";

@Controller('projects')
@ApiTags('project')
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

  // @Get('/statistics')
  // async getStatistics(
  //   @ReqUser() user: AuthPayload
  // ) {
  //   const today = dayjs()
  //   const tasks = await this.db.task.getAll()
  //   const overdueTasks = tasks.filter(task => today.isAfter(task.time.to))

  //   return {
  //     data: {
  //       overdue: overdueTasks,
  //       total: tasks
  //     },
  //     message: ''
  //   }
  // }

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
      message: Messages.common.created,
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
      message: Messages.common.verified,
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
      message: Messages.common.success,
      status: HttpStatus.OK
    }
  }

  @Post('/:projectId/column')
  @ProjectManagerOrAboveRequired()
  async createColumn(
    @Param('projectId') projectId: string,
    @Body() payload: CreateColumnDto
  ) {
    const projectBoard = await this.db.projectBoard.findOne({ project: projectId }).populate('columns')
    const existing = projectBoard.columns.find((c: Column) => c.id.toString() === payload.id)
    if (existing) throw new HttpException("COLUMN_ID_AREADY_EXISTING", HttpStatus.BAD_REQUEST)
    const board = await this.project.createColumn(projectId, payload)
    if (!board) throw new HttpException("CREATE_FAILED", HttpStatus.BAD_REQUEST)
    return {
      data: board,
      message: Messages.common.created,
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

    const projectBoard = await this.db.projectBoard.findOne({ project: projectId }).populate('columns')
    const checkValidColumnName = projectBoard.columns.find((c: Column) => c.id.toString() === payload.id)
    if (checkValidColumnName) throw new HttpException('COLUMN_NAME_EXISTED', HttpStatus.CONFLICT)
    const update = await this.project.updateColumn(columnId, payload)
    if (!update) throw new HttpException("COLUMN_NOT_FOUND", HttpStatus.NOT_FOUND)
    return {
      message: Messages.common.updated,
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
        message: Messages.common.success,
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
      message: Messages.common.updated
    }
  }

  @Get('/:projectId/labels')
  async getProjectlabels(
    @Param('projectId') projectId: string
  ) {
    return {
      data: await this.db.projectLabel.find({ projectId }),
      message: ''
    }
  }

  @Post('/:projectId/label')
  @ProjectManagerOrAboveRequired()
  async createProjectLabel(
    @Param('projectId') projectId: string,
    @Body() payload: CreateLabelDto
  ) {
    const existing = await this.db.projectLabel.findOne({ projectId, title: payload.title })
    if (existing) throw new HttpException(Messages.project.labelExist, HttpStatus.BAD_REQUEST)
    return {
      data: await this.project.createLabel(projectId, payload),
      message: Messages.common.updated
    }
  }

  @Get('/:projectId/milestones')
  async getMilestones(
    @Param('projectId') projectId: string,
  ) {
    const milestones = await this.db.milestone.find({ project: projectId })
    const mappedData = await Promise.all(milestones.map(milestone =>
      this.db.task.find({ milestone: milestone._id }).then(tasks => ({
        milestone,
        tasks
      }))
    ))

    return {
      data: mappedData,
      message: ''
    }
  }

  @Get('/projectId/milestones/:milestoneId')
  async getMilestone(
    @Param('projectId') projectId: string,
    @Param('milestoneId') milestoneId: string,
  ) {
    const milestone = await this.db.milestone.getById(milestoneId);
    const allTasks = await this.db.task.find({ milestone: milestoneId });

    return ({
      data: {
        ...milestone,
        tasks: allTasks
      },
      message: ''
    })
  }

  @Post('/:projectId/milestones')
  async createMilestone(
    @Param('projectId') projectId: string,
    @Body() payload: CreateMilestoneDto
  ) {
    return {
      data: await this.project.createMilestone(projectId, payload),
      message: Messages.common.created
    }
  }

  // @Get('/statistics')
  // async getStatistics(
  //   @ReqUser() user: AuthPayload
  // ) {
  //   console.log(123)
  //   // const today = dayjs()
  //   // const tasks = await this.db.task.find({ assignees: { $in: [user.userId.toString()] } })
  //   // const overdueTasks = tasks.filter(task => today.isAfter(task.time.to))

  //   // return {
  //   //   data: {
  //   //     overdue: overdueTasks,
  //   //     total: tasks
  //   //   },
  //   //   message: ''
  //   // }
  // }


}