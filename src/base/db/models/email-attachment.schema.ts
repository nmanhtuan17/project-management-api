import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

@Schema({
  timestamps: true
})
export class EmailAttachment {
  @ApiProperty()
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: String,
  })
  contentType: string;

  @Prop({
    type: String,
  })
  name: string;

  @Prop({
    type: String,
  })
  url: string;

  @Prop({
    type: Number,
  })
  size: number;

  @Prop({
    type: String,
  })
  cid: string;

  @Prop({
    type: String,
  })
  storageKey: string;
}
