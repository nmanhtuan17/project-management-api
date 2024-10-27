import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BaseRepository } from "@/base/db/repositories";
import { Project, User, VerificationCode, Session, ProjectMember } from "@/base/db/models";
import { PaginateModel } from "mongoose";
import { ProjectInvitation } from "../models/project-invitation.schema";

@Injectable()
export class DbService implements OnApplicationBootstrap {
  user: BaseRepository<User>;
  project: BaseRepository<Project>;
  projectMember: BaseRepository<ProjectMember>;
  projectInvitation: BaseRepository<ProjectInvitation>;
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
    @InjectModel(ProjectMember.name)
    private projectMemberModel: PaginateModel<ProjectMember>,
    @InjectModel(ProjectInvitation.name)
    private projectInvitationModel: PaginateModel<ProjectInvitation>,
  ) {
  }

  onApplicationBootstrap() {
    this.user = new BaseRepository<User>(this.userModel);
    this.project = new BaseRepository<Project>(this.projectModel);
    this.verificationCode = new BaseRepository<VerificationCode>(this.verificationCodeModel);
    this.session = new BaseRepository<Session>(this.sessionModel);
    this.projectMember = new BaseRepository<ProjectMember>(this.projectMemberModel)
    this.projectInvitation = new BaseRepository<ProjectInvitation>(this.projectInvitationModel)
  }
}
