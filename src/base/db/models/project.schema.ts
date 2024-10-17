import { Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import mongoose from "mongoose";

@Schema({
  timestamps: true
})
export class Project {
  @ApiProperty()
  _id: mongoose.Schema.Types.ObjectId

}