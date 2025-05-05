import { Prop, Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose from "mongoose";
import { ProjectMember } from "./project-member.schema";
import { Task } from "./task.schema";

@Schema({
  timestamps: true
})
export class TaskAttachment {
  @ApiProperty()
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: String,
  })
  contentType: string;

  @Prop({
    type: String,
  })
  name: string;
   
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ProjectMember.name
  })
  member: ProjectMember | string;

  @Prop({
    type: String,
  })
  url: string;

  @Prop({
    type: Number,
  })
  size: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Task.name
  })
  task: Task | string;
}

