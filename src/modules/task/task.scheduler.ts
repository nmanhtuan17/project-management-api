import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskService } from './task.service';

@Injectable()
export class TaskScheduler {
  private readonly logger = new Logger(TaskScheduler.name);

  constructor(private readonly taskService: TaskService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleTaskDeadlines() {
    this.logger.log('Checking for upcoming task deadlines...');
    try {
      await this.taskService.checkTaskDeadlines();
      this.logger.log('Task deadline check completed successfully');
    } catch (error) {
      this.logger.error('Error checking task deadlines:', error);
    }
  }
} 