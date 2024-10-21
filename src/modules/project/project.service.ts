import { DbService } from "@/base/db/services";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProjectService {
  constructor(
    private db: DbService
  ){
    
  }

  async getAll() {
    return this.db.project.getAll()
  }
}