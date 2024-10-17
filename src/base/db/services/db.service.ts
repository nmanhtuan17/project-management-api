import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BaseRepository } from "@/base/db/repositories";
import { Project, User } from "@/base/db/models";
import { PaginateModel } from "mongoose";

@Injectable()
export class DbService implements OnApplicationBootstrap {
  user: BaseRepository<User>;
  project: BaseRepository<Project>;

  constructor(
    @InjectModel(User.name)
    private userModel: PaginateModel<User>,
    @InjectModel(User.name)
    private projectModel: PaginateModel<Project>
  ) {
  }

  onApplicationBootstrap() {
    this.user = new BaseRepository<User>(this.userModel);
    this.project = new BaseRepository<Project>(this.projectModel);
  }
}
