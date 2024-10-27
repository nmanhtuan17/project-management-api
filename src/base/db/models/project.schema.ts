import { Messages } from "@/base/config";
import { ProjectTypes } from "@/common/types/project";
import { Prop, Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Project {
  @ApiProperty()
  _id: mongoose.Schema.Types.ObjectId

  @ApiProperty()
  @Prop()
  name: string
  
  @Prop({
    type: String,
  })
  avatar?: string;

  @ApiProperty()
  @Prop({
    type: String,
    match: /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/,
    unique: [true, Messages.project.slugExists],
  })
  slug: string;

  @ApiProperty()
  @Prop({
    select: false,
    default: 50
  })
  membersLimit: number;

  @Prop({
    type: String,
    enum: Object.values(ProjectTypes),
  })
  type: ProjectTypes;

  @Prop({
    type: Number,
    default: 0,
  })
  memberCount?: number;
}