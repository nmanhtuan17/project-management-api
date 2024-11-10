import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Task } from "./task.schema";


@Schema({
 timestamps: true
})
export class Column {
  @Prop({
    type: String,
    required: true
  })
  id: String

  @Prop({
    type: String,
    required: true
  })
  title: String

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Task.name
      }
    ],
    default: []
  })
  cards: Task[]
}
