import { DbService } from "@/base/db/services";
import { Injectable, BadRequestException } from "@nestjs/common";
import { NotificationService } from "../notification/notification.service";
import { NotiType } from "@/common/types/notification";
import { ProjectMember } from "@/base/db/models/project-member.schema";
import { Types } from "mongoose";
import { MailService } from "../mail/mail.service";
import { ConfigService } from "@nestjs/config";
import { User } from "@/base/db/models/user.schema";
import { Task } from "@/base/db/models/task.schema";
import { Project } from "@/base/db/models/project.schema";
import * as dayjs from "dayjs";
import { TaskPerformanceMetricsDto } from "./dto/task-performance.dto";
import { TaskStatus } from "@/common/types";

@Injectable()
export class TaskService {
  constructor(
    private db: DbService,
    private mailService: MailService,
    private config: ConfigService
  ) {}

  async getById(id: string) {
    return await this.db.task.getById(id)
  }

  async validateTaskTimeAgainstMilestone(taskTime: { from: Date; to: Date }, milestoneId: string) {
    if (!milestoneId) return true;

    const milestone = await this.db.milestone.findOne({ _id: milestoneId });
    if (!milestone) {
      throw new BadRequestException('Milestone not found');
    }

    const taskFrom = dayjs(taskTime.from);
    const taskTo = dayjs(taskTime.to);
    const milestoneFrom = dayjs(milestone.time.from);
    const milestoneTo = dayjs(milestone.time.to);

    if (taskFrom.isBefore(milestoneFrom) || taskTo.isAfter(milestoneTo)) {
      throw new BadRequestException('Thời gian thực hiện nhiệm vụ phải nằm trong thời gian milestone');
    }

    return true;
  }

  async checkTaskDeadlines() {
    const tasks = await this.db.task.find({
      status: { $ne: 'completed' }
    }).populate('assignees').populate('project');

    const tasksByUser = new Map<string, Array<Task & { project: Project }>>();

    for (const task of tasks) {
      if (dayjs(task.time.to).isSame(dayjs(), 'day')) {
        const taskObj = task as Task & { project: Project };
        if (taskObj.assignees && taskObj.assignees.length > 0) {
          for (const assignee of taskObj.assignees) {
            const member = assignee as ProjectMember;
            if (member && member.user) {
              const userId = typeof member.user === 'string' ? member.user : member.user._id.toString();
              if (!tasksByUser.has(userId)) {
                tasksByUser.set(userId, []);
              }
              tasksByUser.get(userId).push(taskObj);
            }
          }
        }
      }
    }

    for (const [userId, tasks] of tasksByUser) {
      const user = await this.db.user.findOne({ _id: userId }) as User;
      if (user && user.internalEmail) {
        const webDomain = this.config.get('webDomain');
        const taskList = tasks.map(task => ({
          title: task.title,
          dueDate: dayjs(task.time.to).format('DD/MM/YYYY'),
          projectName: task.project.name,
          taskUrl: `${webDomain}/tasks/${task._id}`
        }));

        await this.mailService.sendEmail({
          From: `noreply@${this.config.get('mail.domain')}`,
          To: user.internalEmail,
          Subject: `Công việc hết hạn hôm nay: ${tasks.length} công việc`,
          HtmlBody: await this.mailService['renderEmail']('task-reminder', {
            taskCount: tasks.length,
            tasks: taskList
          })
        });
      }
    }
  }

  async getMemberTaskPerformance(projectId: string, memberId: string): Promise<TaskPerformanceMetricsDto> {
    const tasks = await this.db.task.find({
      project: projectId,
      assignees: { $in: [memberId] },
      archived: false
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === TaskStatus.DONE).length;
    const onTimeCompletedTasks = tasks.filter(task => {
      if (task.status !== TaskStatus.DONE || !task.time?.to) return false;
      const completionDate = dayjs(task.updatedAt);
      const deadline = dayjs(task.time.to);
      return completionDate.isBefore(deadline) || completionDate.isSame(deadline);
    }).length;

    const delayedTasks = completedTasks - onTimeCompletedTasks;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const onTimeCompletionRate = completedTasks > 0 ? (onTimeCompletedTasks / completedTasks) * 100 : 0;
    const delayRate = completedTasks > 0 ? (delayedTasks / completedTasks) * 100 : 0;

    return {
      completionRate: Number(completionRate.toFixed(1)),
      onTimeCompletionRate: Number(onTimeCompletionRate.toFixed(1)),
      delayRate: Number(delayRate.toFixed(1)),
      totalTasks,
      completedTasks,
      onTimeCompletedTasks,
      delayedTasks
    };
  }

  async getProjectMembersPerformance(projectId: string): Promise<Record<string, TaskPerformanceMetricsDto>> {
    const members = await this.db.projectMember.find({ project: projectId })

    const performanceData: Record<string, TaskPerformanceMetricsDto> = {};
    
    for (const member of members) {
      const memberId = typeof member === 'string' ? member : member._id.toString();
      const metrics = await this.getMemberTaskPerformance(projectId, memberId);
      performanceData[memberId] = metrics;
    }
    return performanceData;
  }

  async getProjectPerformance(projectId: string): Promise<TaskPerformanceMetricsDto> {
    const tasks = await this.db.task.find({ project: projectId, archived: false });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === TaskStatus.DONE).length;
    const onTimeCompletedTasks = tasks.filter(task => {
      if (task.status !== TaskStatus.DONE || !task.time?.to) return false;
      const completionDate = dayjs(task.updatedAt);
      const deadline = dayjs(task.time.to);
      return completionDate.isBefore(deadline) || completionDate.isSame(deadline);  
    }).length;

    const delayedTasks = completedTasks - onTimeCompletedTasks;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const onTimeCompletionRate = completedTasks > 0 ? (onTimeCompletedTasks / completedTasks) * 100 : 0;
    const delayRate = completedTasks > 0 ? (delayedTasks / completedTasks) * 100 : 0;

    return {
      completionRate: Number(completionRate.toFixed(1)),
      onTimeCompletionRate: Number(onTimeCompletionRate.toFixed(1)),
      delayRate: Number(delayRate.toFixed(1)),
      totalTasks,
      completedTasks,
      onTimeCompletedTasks,
      delayedTasks
    }
  }
}
