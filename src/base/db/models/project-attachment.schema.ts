import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Project } from "./project.schema";
import { ProjectMember } from "./project-member.schema";

@Schema({
  timestamps: true
})
export class ProjectAttachment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Project.name
  })
  project: Project | string;

  @Prop({
    type: String,
    required: true,
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
  contentType?: string;

  @Prop({
    type: String,
    required: true,
  })
  storeKey: string;

  @Prop({
    type: Number,
  })
  size: number;
}
export class ProjectAttachmentWithDownloadUrl extends ProjectAttachment {
  url: string;
}