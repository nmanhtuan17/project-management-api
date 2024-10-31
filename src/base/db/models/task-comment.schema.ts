import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { ProjectMember } from './project-member.schema';
import { Task } from './task.schema';

@Schema({
  timestamps: true,
})
export class TaskComment {
  @ApiProperty()
  _id: mongoose.Schema.Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Task.name,
  })
  task: Task | string

  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ProjectMember.name,
  })
  from: ProjectMember | string;

  @ApiProperty()
  @Prop({
    type: String,
    default: '',
  })
  text: string;
}
