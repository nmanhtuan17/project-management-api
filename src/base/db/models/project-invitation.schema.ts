import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Project } from "./project.schema";
import { User } from "./user.schema";

@Schema({
  timestamps: true
})
export class ProjectInvitation {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Project.name
  })
  project: Project | string
  
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name
  })
  user: User | string
  
  @Prop({
    type: String,
    unique: true,
  })
  code: string;
}