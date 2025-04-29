import { DbService } from "@/base/db/services";
import { Injectable } from "@nestjs/common";
import { NotificationService } from "../notification/notification.service";
import { NotiType } from "@/common/types/notification";
import { ProjectMember } from "@/base/db/models/project-member.schema";
import { Types } from "mongoose";
import { MailService } from "../mail/mail.service";
import { ConfigService } from "@nestjs/config";
import { User } from "@/base/db/models/user.schema";
import { Task } from "@/base/db/models/task.schema";
import { Project } from "@/base/db/models/project.schema";

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

  async checkTaskDeadlines() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const overdueTasks = await this.db.task.find({
      'time.to': {
        $gte: today,
        $lt: tomorrow
      },
      status: { $ne: 'completed' }
    }).populate('assignees').populate('project');

    const tasksByUser = new Map<string, Array<Task & { project: Project }>>();

    for (const task of overdueTasks) {
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

    for (const [userId, tasks] of tasksByUser) {
      const user = await this.db.user.findOne({ _id: userId }) as User;
      
      if (user && user.internalEmail) {
        const webDomain = this.config.get('webDomain');
        const taskList = tasks.map(task => ({
          title: task.title,
          dueDate: task.time.to.toLocaleDateString(),
          projectName: task.project.name,
          description: task.description || 'Không có mô tả',
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