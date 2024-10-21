import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { User } from './user.schema';

@Schema({
  timestamps: true,
  expireAfterSeconds: 3600 * 6
})
export class VerificationCode {
  @ApiProperty()
  _id: mongoose.Schema.Types.ObjectId;

  @ApiProperty()
  @Prop({
    type: String,
    unique: true,
  })
  code: string;

  @ApiProperty()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  user: User | string;
}
