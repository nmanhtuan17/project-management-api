
import { ProjectMember } from "@/base/db/models/project-member.schema";
import { User } from "@/base/db/models/user.schema";
import { Prop, Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose from "mongoose";
import { timestamp } from "rxjs";
@Schema({
  timestamps: true
})
export class DeviceToken {
  @ApiProperty()
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name
  })
  user: User | string

  @Prop({
    type: String
  })
  fcmToken: string;
}