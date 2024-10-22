import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BaseRepository } from "@/base/db/repositories";
import { Project, User, VerificationCode, Session } from "@/base/db/models";
import { PaginateModel } from "mongoose";

@Injectable()
export class DbService implements OnApplicationBootstrap {
  user: BaseRepository<User>;
  project: BaseRepository<Project>;
  verificationCode: BaseRepository<VerificationCode>;
  session: BaseRepository<Session>;
  constructor(
    @InjectModel(User.name)
    private userModel: PaginateModel<User>,
    @InjectModel(Project.name)
    private projectModel: PaginateModel<Project>,
    @InjectModel(VerificationCode.name)
    private verificationCodeModel: PaginateModel<VerificationCode>,
    @InjectModel(Session.name)
    private sessionModel: PaginateModel<Session>,
  ) {
  }

  onApplicationBootstrap() {
    this.user = new BaseRepository<User>(this.userModel);
    this.project = new BaseRepository<Project>(this.projectModel);
    this.verificationCode = new BaseRepository<VerificationCode>(this.verificationCodeModel);
    this.session = new BaseRepository<Session>(this.sessionModel);

  }
}
