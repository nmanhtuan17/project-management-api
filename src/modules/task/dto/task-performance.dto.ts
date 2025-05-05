import { ApiProperty } from '@nestjs/swagger';

export class TaskPerformanceMetricsDto {
  @ApiProperty({
    description: 'Task Completion Rate (percentage of completed tasks)',
    example: 75.5
  })
  completionRate: number;

  @ApiProperty({
    description: 'On-Time Completion Rate (percentage of tasks completed on or before deadline)',
    example: 80.0
  })
  onTimeCompletionRate: number;

  @ApiProperty({
    description: 'Task Delay Rate (percentage of tasks completed after deadline)',
    example: 20.0
  })
  delayRate: number;

  @ApiProperty({
    description: 'Total number of tasks assigned',
    example: 20
  })
  totalTasks: number;

  @ApiProperty({
    description: 'Number of completed tasks',
    example: 15
  })
  completedTasks: number;

  @ApiProperty({
    description: 'Number of on-time completed tasks',
    example: 12
  })
  onTimeCompletedTasks: number;

  @ApiProperty({
    description: 'Number of delayed tasks',
    example: 3
  })
  delayedTasks: number;
} 