import mongoose, { mongo } from 'mongoose';
import { Prop, Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { TaskTime } from '@/modules/task/dto/task.dto';
import { Project } from './project.schema';
import { MilestoneStatus } from '@/common/types';



@Schema({
  timestamps: true
})
export class Milestone {
  @ApiProperty({})
  _id: mongoose.Schema.Types.ObjectId

  @Prop({
    type: String,
    required: true

  })
  title: string;

  @ApiProperty()
  @Prop({
    type: TaskTime,
    required: true
  })
  time: TaskTime;

  @Prop({
    type: String
  })
  description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Project.name
  })
  project: Project | string

  @Prop({
    type: Boolean,
    required: true
  })
  closed: boolean
}