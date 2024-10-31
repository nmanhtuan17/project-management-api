import { DbService } from "@/base/db/services";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TaskService {
  constructor(
    private db: DbService
  ) {

  }
  async getById(id: string) {
    return await this.db.task.getById(id)
  }
}