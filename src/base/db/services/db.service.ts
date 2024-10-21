import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BaseRepository } from "@/base/db/repositories";
import { Project, User, VerificationCode } from "@/base/db/models";
import { PaginateModel } from "mongoose";

@Injectable()
export class DbService implements OnApplicationBootstrap {
  user: BaseRepository<User>;
  project: BaseRepository<Project>;
  verificationCode: BaseRepository<VerificationCode>;

  constructor(
    @InjectModel(User.name)
    private userModel: PaginateModel<User>,
    @InjectModel(Project.name)
    private projectModel: PaginateModel<Project>,
    @InjectModel(VerificationCode.name)
    private verificationCodeModel: PaginateModel<VerificationCode>,
  ) {
  }

  onApplicationBootstrap() {
    this.user = new BaseRepository<User>(this.userModel);
    this.project = new BaseRepository<Project>(this.projectModel);
    this.verificationCode = new BaseRepository<VerificationCode>(this.verificationCodeModel);
  }
}
