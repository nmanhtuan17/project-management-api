import { BadRequestException, Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Param, Post, Put, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Messages } from "@/base/config";
import { FilterQuery, HydratedDocument, Types } from "mongoose";
import { Task } from "@/base/db";
import { ReqUser } from "@/common/decorators/req-user.decorator";
import { CreateTaskCommentDto, CreateTaskDto, TaskFilterDto, UpdateTaskDto } from "./dto/task.dto";
import { Payload } from "../auth/dto/auth.dto";
import { DbService } from "@/base/db/services";
import { TaskService } from "./task.service";
import { ProjectService } from "../project/project.service";
import { ApiTaskFilter, TaskFilter } from "./decorators/task-filter.decorator";
import { ApiPagination } from "@/common/decorators/api-pagination.decorator";
import { PaginationDto, TaskActivityType } from "@/common/types";
import { Pagination } from "@/common/decorators/pagination.decorator";
import { StorageService } from "@/base/services";
import { compareArrayString } from "@/common/utils";

@Controller('projects/:projectId/tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('tasks')
export class TaskController {
  constructor(
    private db: DbService,
    private task: TaskService,
    private project: ProjectService,
    private storage: StorageService,
  ) {
  }

  @Get('/')
  @ApiPagination()
  @ApiTaskFilter()
  public async getProjectTasks(
    @Param('projectId') projectId: string,
    @ReqUser() payload: Payload,
    @Pagination() paginationDto?: PaginationDto,
    @TaskFilter() taskFilter?: TaskFilterDto,
  ) {
    let additionalQuery = {};

    const query = taskFilter.query;
    if (query && query?.trim() !== '') {
      additionalQuery['title'] = { $regex: query, $options: 'i' };
    }

    for (let key in taskFilter) {
      if (taskFilter[key] && !['query'].includes(key)) {
        additionalQuery[key] = taskFilter[key];
      }
    }

    const filter: FilterQuery<Task> = {
      project: projectId,
      archived: false,
      ...additionalQuery,
    };

    if (taskFilter.assignees) filter.assignees = {
      $in: taskFilter.assignees.map(item => new Types.ObjectId(item)),
    };

    if (taskFilter.priority) filter.priority = {
      $in: taskFilter.priority,
    };


    const membership = await this.project.getProjectMember(projectId, payload.userId);
    const tasks = await this.db.task.paginate(filter, {
      populate: [
        'assignees.user',
        'attachments',
        'labels',
      ],
      limit: paginationDto.limit,
      page: paginationDto.page,
      sort: (paginationDto.sortType === 'asc' ? '+' : '-') + paginationDto.sortBy,
    });
    const signedTasks = await Promise.all(tasks.docs.map(task => new Promise(async resolve => {
      resolve({
        ...task.toJSON(),
        attachments: await this.storage.getSignedTaskAttachments(task),
      });
    })));
    return {
      data: signedTasks,
      _pagination: tasks,
    };
  }

  @Get('/:taskId')
  public async getProjectTask(
    @Param('projectId') spaceId: string,
    @Param('taskId') taskId: string,
    @ReqUser() payload: Payload,
  ) {
    const membership = await this.project.getProjectMember(spaceId, payload.userId);
    const task = await this.db.task.findOne({
      _id: taskId,
    }).populate('assignees attachments labels');

    return {
      data: {
        ...task.toJSON(),
        attachments: await this.storage.getSignedTaskAttachments(task),
      },
    };
  }

  @Get('/:taskId/sub-tasks')
  public async getProjectTaskSubTasks(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @ReqUser() user: Payload,
  ) {
    await this.project.getProjectMember(projectId, user.userId);
    const tasks = await this.db.task.find({
      parentTask: taskId,
    }).populate('assignees attachments labels');
    return {
      data: await Promise.all(tasks.map(async task => {
        return {
          ...task.toJSON(),
          attachments: await this.storage.getSignedTaskAttachments(task),
        };
      })),
    };
  }

  // @Get('/:taskId/activities')
  // public async getTaskActivities(
  //   @Param('projectId') projectId: string,
  //   @Param('taskId') taskId: string,
  //   @ReqUser() user: Payload,
  // ) {
  //   await this.project.getProjectMember(projectId, user.userId);
  //   const task = await this.db.task.findOne({
  //     _id: taskId,
  //   });
  //   if (!task) throw new HttpException(Messages.task.taskNotFound, HttpStatus.NOT_FOUND);
  //   const activities = await this.db.taskActivity.find({
  //     task: task._id.toString(),
  //   }).populate('member');
  //   let data = [];
  //   for (let act of activities) {
  //     switch (act.type) {
  //       case TaskActivityType.Comment:
  //         let comment = await this.db.comment.findOne({
  //           _id: act.linkedItemId,
  //         });
  //         if (comment) {
  //           act.meta = comment.toJSON();
  //         } else continue;
  //     }
  //     data.push(act.toJSON());
  //   }
  //   return {
  //     data,
  //   };
  // }

  @Put('/:taskId')
  public async updateProjectTask(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @ReqUser() user: Payload,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const me = await this.project.getProjectMember(projectId, user.userId);
    const task = await this.db.task.findOne({
      _id: taskId,
    }).populate('assignees');
    if (!task) throw new HttpException(Messages.task.taskNotFound, HttpStatus.NOT_FOUND);
    let updatableFields = ['title', 'description', 'status', 'type', 'priority', 'time', 'attachments', 'parentTask', 'labels', 'assignees'];

    for (let field of updatableFields) {
      if (updateTaskDto[field] && updateTaskDto[field] !== task[field]) {
        if (field === 'time' && updateTaskDto[field]?.from.toString() === task[field]?.from.toISOString() && updateTaskDto[field]?.to.toString() === task[field]?.to.toISOString()) continue;
        if (field === 'attachments' && compareArrayString(updateTaskDto[field], task.attachments.map(a => a.toString()))) continue;
        if (field === 'assignees' && compareArrayString(updateTaskDto[field], task.assignees.map(a => a.toString()))) continue;
        if (field === 'labels' && compareArrayString(updateTaskDto[field], task.labels.map(a => a.toString()))) continue;
        if (field === 'parentTask') {
          const willBeParent = await this.task.getById(updateTaskDto.parentTask);
          if (task.project?.toString() || willBeParent.project?.toString()) {
            if (task.project?.toString() !== willBeParent.project?.toString())
              throw new ForbiddenException(Messages.common.actionNotPermitted);
          }
        }
        await this.db.taskActivity.create({
          type: TaskActivityType.Update,
          member: me._id.toString(),
          field,
          task: task._id.toString(),
          meta: {
            oldValue: task[field],
            newValue: updateTaskDto[field],
          },
        });
      }
    }
    if (updateTaskDto && updateTaskDto.labels && updateTaskDto.labels.length > 0) {
      if (!task.project) throw new BadRequestException(Messages.task.notProjectTask);
      const validateLabels = await this.db.projectLabel.find({
        _id: { $in: updateTaskDto.labels },
      });
      if (validateLabels.length !== updateTaskDto.labels.length) {
        throw new BadRequestException(Messages.common.actionNotPermitted);
      }
    }
    if (updateTaskDto && updateTaskDto.attachments && updateTaskDto.attachments.length !== 0) {
      const oldAttachments = task.attachments as string[];
      const newAttachments = updateTaskDto.attachments.filter((item: string) => !oldAttachments.includes(item));
      const inDbAttachments = await this.db.projectAttachment.find({
        _id: {
          $in: newAttachments,
        },
      });
      if (inDbAttachments.length !== newAttachments.length) throw new HttpException(Messages.common.invalidAttachments, HttpStatus.BAD_REQUEST);
      for (let attachment of inDbAttachments) {
        if (attachment.member.toString() !== me._id.toString()) throw new HttpException(Messages.common.actionNotPermitted, HttpStatus.BAD_REQUEST);
      }
    }
    if (updateTaskDto.assignees) {
      const counted = await this.db.projectMember.count({
        _id: {
          $in: updateTaskDto.assignees,
        },
        project: projectId,
      });
      if (counted !== updateTaskDto.assignees.length) throw new HttpException(Messages.task.invalidAssignee, HttpStatus.BAD_REQUEST);
    }
    Object.assign(task, updateTaskDto);
    await task.save();
    let signAttachments = await task.populate('attachments assignees');

    return {
      message: Messages.task.taskUpdated,
      data: {
        task: {
          ...signAttachments.toJSON(),
          attachments: await this.storage.getSignedTaskAttachments(signAttachments),
        },
      },
    };
  }

  @Post('/:taskId/comments')
  public async createTaskComment(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @ReqUser() payload: Payload,
    @Body() createCommentDto: CreateTaskCommentDto,
  ) {
    const member = await this.project.getProjectMember(projectId, payload.userId);
    const task = await this.db.task.findOne({
      _id: taskId,
    });
    if (!task) throw new HttpException(Messages.task.taskNotFound, HttpStatus.NOT_FOUND);
    const newComment = await this.db.taskComment.create({
      task: task._id.toString(),
      from: payload.userId,
      text: createCommentDto.text
    })
    await this.db.taskActivity.create({
      type: TaskActivityType.Comment,
      member: member._id.toString(),
      linkedItemId: newComment._id.toString(),
      task: task._id.toString(),
    });
    return {
      data: newComment,
    };
  }

  @Get('/:taskId/comments')
  public async getTaskComments(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @ReqUser() payload: Payload,
  ) {
    const member = await this.project.getProjectMember(projectId, payload.userId);
    const task = await this.task.getById(taskId);
    if (!task) throw new HttpException(Messages.task.taskNotFound, HttpStatus.NOT_FOUND);
    const comments = await this.db.taskComment.find({
      task: task._id,
    }).populate('from');
    return {
      data: comments.map(c => c.toJSON()),
    };
  }

  @Post('/')
  public async createProjectTask(
    @Param('projectId') projectId: string,
    @ReqUser() payload: Payload,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const member = await this.project.getProjectMember(projectId, payload.userId);

    if (createTaskDto.assignees) {
      // validate all assignees
      const counted = await this.db.projectMember.count({
        _id: {
          $in: createTaskDto.assignees,
        },
        project: projectId,
      });
      if (counted !== createTaskDto.assignees.length) throw new HttpException(Messages.task.invalidAssignee, HttpStatus.BAD_REQUEST);
    }

    let parentTask: HydratedDocument<Task>;

    if (createTaskDto.parentTask) {
      parentTask = await this.db.task.findOne({
        _id: createTaskDto.parentTask,
        project: projectId,
      });
      if (!parentTask) throw new HttpException(Messages.task.invalidParentTask, HttpStatus.NOT_FOUND);

      if (parentTask.project && parentTask.project.toString() !== projectId)
        throw new BadRequestException(Messages.task.invalidParentTask);
    }

    const newTask = await this.db.task.create({
      project: projectId,
      title: createTaskDto.title,
      description: createTaskDto.description,
      type: createTaskDto.type,
      assignees: createTaskDto.assignees,
      time: createTaskDto.time,
      archived: false,
      parentTask: parentTask?._id?.toString() ?? undefined,
      status: createTaskDto.status,
      priority: createTaskDto.priority,
    });

    return {
      data: newTask,
      message: Messages.task.taskCreated,
    };
  }
}