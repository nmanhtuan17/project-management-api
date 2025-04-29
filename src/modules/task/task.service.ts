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
      throw new BadRequestException('Task time period must be within milestone time period');
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
}