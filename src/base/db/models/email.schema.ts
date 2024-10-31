import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { EmailAttachment } from "./email-attachment.schema";
import { ProjectMember } from './project-member.schema';
import { EmailType } from '@/common/types';

@Schema({
  timestamps: true,
})
export class Email {
  @ApiProperty()
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId
  })
  owner: mongoose.Schema.Types.ObjectId | string;

  @Prop({
    type: [String],
    default: ['inbox']
  })
  labels?: string[]

  @Prop({
    type: String,
    enum: Object.values(EmailType),
  })
  type: EmailType;

  @Prop({
    type: String,
  })
  messageId: string;

  @Prop({
    type: String,
  })
  from: string;

  @Prop({
    type: [String],
  })
  to: string;

  @Prop({
    type: [String],
  })
  cc?: string[];

  @Prop({
    type: [String],
  })
  bcc?: string[];

  @Prop({
    type: String,
  })
  sender: string;

  @Prop({
    type: [String],
  })
  recipient: string;

  @Prop({
    type: String,
  })
  subject: string;

  @Prop({
    type: String,
  })
  body: string;

  @Prop({
    type: [String]
  })
  headers: string[];

  @Prop({
    type: String,
  })
  strippedText: string;

  @Prop({
    type: String,
  })
  replyTo?: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  seen?: boolean;

  @Prop({
    type: String,
    default: '',
  })
  dkimSignature?: string;

  @Prop({
    type: String,
  })
  contentType?: string;

  @Prop({
    type: mongoose.Schema.Types.Mixed
  })
  raw: any;

  @Prop({
    type: Boolean,
    default: false,
  })
  claimed?: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: ProjectMember.name
  })
  member?: ProjectMember | string;

  @Prop({
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: EmailAttachment.name,
    }],
    default: [],
  })
  attachments?: EmailAttachment[] | string[];

  createdAt?: Date;
}
