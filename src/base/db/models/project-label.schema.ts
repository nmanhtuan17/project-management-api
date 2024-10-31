import { Prop, Schema } from "@nestjs/mongoose";
import { IsOptional } from "class-validator";
import mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class ProjectLabel {
  _id?: mongoose.Schema.Types.ObjectId;
  @Prop({
    type: String,
  })
  title: string;

  @Prop({
    type: String,
  })
  @IsOptional()
  description?: string;

  @Prop({
    type: String,
  })
  backgroundColor: string;
}