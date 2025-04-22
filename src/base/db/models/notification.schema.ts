import { Task, User } from "@/base/db/models";
import { NotiType } from "@/common/types/notification";
import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class NotificationSchema {
  _id: mongoose.Schema.Types.ObjectId

  @Prop({
    type: String
  })
  type: NotiType

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name
  })
  user: User | string

  @Prop({
    type: String
  })
  title: string

  @Prop({
    type: String
  })
  body: string

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Task.name
  })
  task?: Task | string
}