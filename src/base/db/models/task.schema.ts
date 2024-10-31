import { Prop, Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose from "mongoose";
import { Project } from "./project.schema";
import { Messages } from "@/base/config";
import { IsOptional } from "class-validator";
import { TaskPriority, TaskStatus, TaskTypes } from "@/common/types/task";
import { ProjectMember } from "./project-member.schema";
import { ProjectLabel } from "./project-label.schema";
import { ProjectAttachment } from "./project-attachment.schema";

@Schema({
  timestamps: true
})
export class Task {
  @ApiProperty()
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Project.name,
    index: true,
    required: [true, Messages.task.taskMustInProject]
  })
  @ApiProperty()
  project: Project | string;

  @ApiProperty()
  @Prop({
    type: String,
    required: [true, Messages.task.taskTitleRequired]
  })
  title: string;

  @ApiProperty()
  @Prop({
    type: String
  })
  @IsOptional()
  description?: string;

  @ApiProperty()
  @Prop({
    type: String,
    enum: Object.values(TaskTypes),
    required: [true, Messages.task.taskTypeRequired]
  })
  type: TaskTypes;

  @ApiProperty()
  @Prop({
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.PENDING
  })
  status?: TaskStatus;

  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Task.name
  })
  parentTask?: Task | string;

  @ApiProperty()
  @Prop({
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: Task.name
    }],
    default: []
  })
  linkedTasks?: Task[] | string[];

  @ApiProperty()
  @Prop({
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: ProjectMember.name
    }],
    default: []
  })
  assignees?: ProjectMember[] | string[];

  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ProjectMember.name
  })
  reporter?: ProjectMember | string;

  @ApiProperty()
  @Prop({
    type: Number,
    default: TaskPriority.MEDIUM
  })
  priority?: number;

  @ApiProperty()
  @Prop({
    type: Date
  })
  dueDate?: Date;

  @ApiProperty()
  @Prop({
    type: Boolean,
    default: false
  })
  archived?: boolean;

  @ApiProperty()
  @Prop({
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: ProjectAttachment.name
    }],
    default: []
  })
  attachments?: ProjectAttachment[] | string[];

  @Prop({
    type: Number,
    default: new Date().getTime()
  })
  pos?: number;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: ProjectLabel.name,
    default: [],
  })
  labels?: ProjectLabel[] | string[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}