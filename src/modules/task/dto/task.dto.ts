import { Messages } from '@/base/config';
import { IsOptionalNonNullable } from '@/common/decorators/optional-non-nullable.decorator';
import { TaskPriority, TaskStatus, TaskTypes } from '@/common/types/task';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { enumToArray } from 'src/common/utils';

export class TaskTime {

  @IsDateString({}, {
    message: Messages.common.invalidDate,
  })
  from: Date

  @IsDateString({}, {
    message: Messages.common.invalidDate,
  })
  to: Date
}

export class CreateTaskDto {
  @ApiProperty({
    type: String,
    example: 'Example task',
    description: 'Task title',
  })
  @IsString({
    message: Messages.task.taskTitleRequired,
  })
  @IsNotEmpty({
    message: Messages.task.taskTitleRequired,
  })
  title: string;

  @ApiProperty({
    type: String,
    example: 'Example task description',
    description: 'Task description',
  })
  @IsString({
    message: Messages.task.invalidTaskDescription,
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: String,
    enum: Object.values(TaskTypes),
  })
  @IsString({
    message: Messages.task.invalidTaskType,
  })
  @IsNotEmpty({
    message: Messages.task.taskTypeRequired,
  })
  @IsEnum(Object.values(TaskTypes), {
    message: Messages.task.invalidTaskType,
  })
  type: TaskTypes;

  @IsMongoId({ each: true })
  @IsOptionalNonNullable()
  assignees?: string[];

  @ApiProperty({
    type: TaskTime
  })
  @IsOptionalNonNullable()
  time?: TaskTime;

  @ApiProperty({})
  @IsString()
  @IsOptionalNonNullable()
  parentTask?: string;

  @Transform((e) => {
    return +e.value;
  })
  @IsNumber()
  @IsOptional()
  @IsEnum(Object.values(TaskPriority))
  priority?: TaskPriority;

  @IsString()
  status?: string;
}

export class UpdateTaskDto {
  @ApiProperty({
    type: String,
    example: 'Example task',
    description: 'Task title',
  })
  @IsString({
    message: Messages.task.taskTitleRequired,
  })
  title?: string;

  @ApiProperty({
    type: String,
    example: 'Sample task description',
    description: 'Task description',
  })
  @IsString({
    message: Messages.task.invalidTaskDescription,
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    type: String,
    enum: Object.values(TaskTypes),
  })
  @IsString({
    message: Messages.task.invalidTaskType,
  })
  @IsEnum(Object.values(TaskTypes), {
    message: Messages.task.invalidTaskType,
  })
  type?: TaskTypes;

  @ApiProperty({
    type: String,
    enum: Object.values(TaskStatus),
  })
  @IsString({
    message: Messages.task.invalidTaskStatus,
  })
  status?: string;

  @ApiProperty({
    type: String,
    enum: Object.values(TaskPriority),
  })
  @IsNumber({}, {
    message: Messages.task.invalidTaskPriority,
  })
  @IsEnum(Object.values(TaskPriority), {
    message: Messages.task.invalidTaskPriority,
  })
  priority?: TaskPriority;

  @ApiProperty({
    type: TaskTime,
  })
  @IsOptionalNonNullable()
  time?: TaskTime;

  @ApiProperty({
    type: Boolean,
  })
  @IsOptionalNonNullable()
  @IsBoolean()
  archived?: boolean;

  @ApiProperty({
    type: [String],
  })
  @IsOptionalNonNullable()
  @IsString({ each: true })
  attachments: string[];

  @ApiProperty({})
  @IsString()
  @IsOptionalNonNullable()
  parentTask?: string;

  @IsNumber()
  pos?: number;

  @IsString({ each: true })
  labels?: string[];

  @IsMongoId({ each: true })
  @IsOptionalNonNullable()
  assignees?: string[];
}

export class CreateTaskCommentDto {
  @ApiProperty({
    type: String,
    example: 'Some comment...',
    description: 'Comment text',
  })
  @IsString({
    message: Messages.post.commentTextRequired,
  })
  @IsNotEmpty({
    message: Messages.post.commentTextRequired,
  })
  text: string;
}


export class TaskFilterDto {
  @IsOptional()
  @IsString()
  @Expose()
  query?: string;

  @ApiProperty({
    type: String,
    enum: enumToArray(TaskTypes),
  })
  @Expose()
  @Transform(({ value }) => {
    if (value === 'all' || value === '') return enumToArray(TaskTypes);
    return value?.trim().split(',');
  })
  @IsEnum(TaskTypes, {
    each: true,
    message: Messages.task.invalidTaskType,
  })
  type?: TaskTypes[];

  @ApiProperty({
    type: String,
    enum: enumToArray(TaskStatus),
  })
  @IsOptional()
  @Expose()
  @Transform(({ value }) => {
    if (value === 'all' || value === '') return enumToArray(TaskStatus);
    return value?.trim().split(',');
  })
  @IsOptionalNonNullable()
  @IsEnum(TaskStatus, {
    each: true,
    message: Messages.task.invalidTaskStatus,
  })
  status?: TaskStatus[];

  @ApiProperty({
    type: String,
    enum: enumToArray(TaskPriority),
  })
  @Expose()
  @Transform(({ value }) => {
    if (value === 'all' || value === '') return enumToArray(TaskPriority);
    return value?.trim().split(',').map((item: string) => parseInt(item));
  })
  @IsOptionalNonNullable()
  @IsEnum(TaskPriority, {
    each: true,
    message: Messages.task.invalidTaskPriority,
  })
  priority?: TaskPriority[];

  @ApiProperty({
    type: String,
    example: '666954f1c7bca60bf98dfb0a, 666954f1c7bca60bf98df2aw',
    required: false,
  })
  @IsOptional()
  @Expose()
  @Transform(({ value }) => value?.split(',')?.map((item: string) => item?.trim()))
  @IsMongoId({
    each: true,
    message: Messages.task.invalidAssignee,
  })
  assignees?: string[];

  @IsOptional()
  @Expose()
  @IsBoolean()
  @Transform(({ value }) => {
    return value === 'true' ? true : value === 'false' ? false : null;
  })
  archived?: boolean;
}