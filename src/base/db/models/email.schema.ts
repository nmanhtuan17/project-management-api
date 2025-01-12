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
    type: String
  })
  Tag?: string

  @Prop({
    type: String,
    enum: Object.values(EmailType),
  })
  MessageStream: EmailType;

  @Prop({
    type: String,
  })
  MessageId: string;

  @Prop({
    type: String,
  })
  FromName: string;

  @Prop({
    type: String,
  })
  From: string;

  @Prop({
    type: [String],
  })
  To: string;

  @Prop({
    type: [String],
  })
  Cc?: string[];

  @Prop({
    type: [String],
  })
  Bcc?: string[];

  @Prop({
    type: String,
  })
  Sender: string;

  @Prop({
    type: [String],
  })
  OriginalRecipient: string;

  @Prop({
    type: String,
  })
  Subject: string;

  @Prop({
    type: String,
  })
  TextBody: string;

  @Prop({
    type: String,
  })
  HtmlBody: string;

  @Prop({
    type: [String]
  })
  Headers: string[];

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
  Attachments?: EmailAttachment[] | string[];

  @Prop({
    type: String
  })
  Date: string

  createdAt?: Date;
}
