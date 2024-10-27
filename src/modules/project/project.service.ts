import { DbService } from "@/base/db/services";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateProjectDto } from "./dto/project.dto";
import { Payload } from "../auth/dto/auth.dto";
import { Messages } from "@/base/config";
import { ProjectRoles } from "@/common/types/project";
import { randomString, slugify } from "@/common/utils";
import { HydratedDocument } from "mongoose";
import { Project } from "@/base/db";

@Injectable()
export class ProjectService {
  constructor(
    private db: DbService
  ) {

  }

  async getAll() {
    return this.db.project.getAll()
  }

  async getProject(projectId: string) {
    const project = await this.db.project.getById(projectId);
    if (!project) throw new HttpException(Messages.common.invalidProject, HttpStatus.NOT_FOUND);
    return project;
  }

  async createProject(payload: CreateProjectDto) {
    const { name, slug, type } = payload
    const existing = await this.db.project.findOne({
      slug
    })

    if (existing) throw new HttpException(Messages.project.slugExists, HttpStatus.BAD_REQUEST)
    const project = await this.db.project.create({
      name,
      slug,
      type,
      membersLimit: 50
    })

    console.log(project)
    return project
  }

  async addMember(projectId: string, userId: string, role: ProjectRoles) {
    const project = await this.getProject(projectId);
    const user = await this.db.user.getById(userId);
    if (!user) throw new HttpException(Messages.common.invalidUser, HttpStatus.NOT_FOUND);

    const update = await this.db.projectMember.findOneAndUpdate({
      project: project._id,
      user: user._id,
    }, {
      role: role,
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    await this.updateCalculateMember(project);
    return update;
  }

  async updateCalculateMember(targetProject: string | HydratedDocument<Project>) {
    const total = await this.db.projectMember.count({
      project: typeof targetProject === 'string' ? targetProject : targetProject._id,
    });
    let project: HydratedDocument<Project>;
    if (typeof targetProject === 'string') {
      project = await this.getProject(targetProject);
    } else project = targetProject;
    project.memberCount = total;
    await project.save();
    return total;
  }

  async getProjectMembers(projectId: string) {
    return await this.db.projectMember.find({ project: projectId }).populate('user', '-password')
  }

  async getProjectMember(projectId: string, userId: string) {
    return await this.db.projectMember.findOne({
      project: projectId,
      user: userId
    })
  }

  
}