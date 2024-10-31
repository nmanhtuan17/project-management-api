import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Task } from "./task.schema";
import { TaskActivityType } from '@/common/types';
import { ProjectMember } from './project-member.schema';

@Schema({
  timestamps: true,
})
export class TaskActivity {
  @ApiProperty()
  _id: mongoose.Schema.Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: String,
    enum: Object.values(TaskActivityType),
  })
  type: TaskActivityType;

  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Task.name
  })
  task: Task | string;

  @ApiProperty()
  @Prop({
    type: String,
  })
  field?: string;

  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ProjectMember.name,
  })
  member: ProjectMember | string;

  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.Mixed,
  })
  meta?: any;

  @ApiProperty()
  @Prop({
    type: String,
  })
  linkedItemId?: string;
}
