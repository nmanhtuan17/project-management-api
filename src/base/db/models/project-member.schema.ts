import { Prop, Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose from "mongoose";
import { User } from "./user.schema";
import { Project } from "./project.schema";
import { ProjectRoles } from "@/common/types/project";

@Schema({
 timestamps: true
})
export class ProjectMember {
  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name
  })
  user: User | string

  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Project.name
  })
  project: Project | string

  @ApiProperty()
  @Prop({
    type: String,
    enum: Object.values(ProjectRoles)
  })
  role: ProjectRoles;
}