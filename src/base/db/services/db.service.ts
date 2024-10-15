import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BaseRepository } from "@/base/db/repositories";
import { User } from "@/base/db/models";
import { PaginateModel } from "mongoose";

@Injectable()
export class DbService implements OnApplicationBootstrap {
  user: BaseRepository<User>;

  constructor(
    @InjectModel(User.name)
    private userModel: PaginateModel<User>
  ) {
  }

  onApplicationBootstrap() {
    this.user = new BaseRepository<User>(this.userModel);
  }
}
