import { User } from "@/base/db/models";
import { Prop, Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose from "mongoose";

@Schema({
  timestamps: true,
})
export class Session {
  @ApiProperty()
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name
  })
  user: User | string;

  @Prop({
    type: String,
  })
  platform: string;

  @Prop({
    type: String
  })
  deviceName?: string;

  @Prop({
    type: String,
  })
  deviceOS?: string;

  @Prop({
    type: String,
  })
  fcmToken?: string;

  @Prop({
    type: Date,
  })
  expirationDate: Date;
}
