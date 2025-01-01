import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { SystemRoles } from '@/common/types';

@Schema({
  timestamps: true,
})
export class User {
  @ApiProperty()
  _id: mongoose.Schema.Types.ObjectId

  @ApiProperty()
  @Prop()
  avatar?: string;

  @ApiProperty()
  @Prop()
  fullName: string;

  @Prop({})
  password?: string;

  @ApiProperty()
  @Prop({
    type: String,
    unique: true,
  })
  email: string;

  @ApiProperty()
  @Prop({
    type: String,
    unique: true,
  })
  internalEmail?: string;

  @ApiProperty()
  @Prop({
    type: String
  })
  alias?: string;

  @ApiProperty()
  @Prop()
  emailVerified: boolean;

  @ApiProperty()
  @Prop({})
  googleId?: string;

  @ApiProperty()
  @Prop({})
  bio?: string;
}
