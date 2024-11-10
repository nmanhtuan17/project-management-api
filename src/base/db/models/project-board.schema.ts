import { Prop, Schema } from "@nestjs/mongoose";
import { Project } from "./project.schema";
import mongoose from "mongoose";
import { Column } from "./column.schema";
import { ApiProperty } from "@nestjs/swagger";

@Schema({
  timestamps: true
})
export class ProjectBoard {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Project.name
  })
  @ApiProperty()
  project: Project | string;

  @Prop({
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: Column.name
    }],
    default: []
  })
  columns: Column[] | string[]
}