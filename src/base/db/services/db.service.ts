import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BaseRepository } from "@/base/db/repositories";
import { Project, User, VerificationCode, Session, ProjectMember, Task, ProjectAttachment, ProjectLabel, Email, EmailAttachment, TaskActivity, TaskComment } from "@/base/db/models";
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
  task: BaseRepository<Task>;
  projectAttachment: BaseRepository<ProjectAttachment>;
  projectLabel: BaseRepository<ProjectLabel>;
  email: BaseRepository<Email>;
  emailAttachment: BaseRepository<EmailAttachment>;
  taskActivity: BaseRepository<TaskActivity>;
  taskComment: BaseRepository<TaskComment>;

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
    @InjectModel(Task.name)
    private taskModel: PaginateModel<Task>,
    @InjectModel(ProjectAttachment.name)
    private projectAttachmentModel: PaginateModel<ProjectAttachment>,
    @InjectModel(ProjectLabel.name)
    private projectLabelModel: PaginateModel<ProjectLabel>,
    @InjectModel(Email.name)
    private emailModel: PaginateModel<Email>,
    @InjectModel(EmailAttachment.name)
    private emailAttachmentModel: PaginateModel<EmailAttachment>,
    @InjectModel(TaskActivity.name)
    private taskActivityModel: PaginateModel<TaskActivity>,
    @InjectModel(TaskComment.name)
    private taskCommentModel: PaginateModel<TaskComment>,
  ) {
  }

  onApplicationBootstrap() {
    this.user = new BaseRepository<User>(this.userModel);
    this.project = new BaseRepository<Project>(this.projectModel);
    this.verificationCode = new BaseRepository<VerificationCode>(this.verificationCodeModel);
    this.session = new BaseRepository<Session>(this.sessionModel);
    this.projectMember = new BaseRepository<ProjectMember>(this.projectMemberModel)
    this.projectInvitation = new BaseRepository<ProjectInvitation>(this.projectInvitationModel)
    this.task = new BaseRepository<Task>(this.taskModel)
    this.projectAttachment = new BaseRepository<ProjectAttachment>(this.projectAttachmentModel)
    this.projectLabel = new BaseRepository<ProjectLabel>(this.projectLabelModel)
    this.email = new BaseRepository<Email>(this.emailModel)
    this.emailAttachment = new BaseRepository<EmailAttachment>(this.emailAttachmentModel)
    this.taskActivity = new BaseRepository<TaskActivity>(this.taskActivityModel)
    this.taskComment = new BaseRepository<TaskComment>(this.taskCommentModel)
  }
}
