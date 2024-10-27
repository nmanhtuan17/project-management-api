import { DbService } from "@/base/db/services";
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ProjectService } from "./project.service";
import { ReqUser } from "@/common/decorators/req-user.decorator";
import { Payload } from "../auth/dto/auth.dto";
import { ProjectManagerOrAboveRequired } from "./decorators/project.decorator";
import { Messages } from "@/base/config";
import { ProjectRoles, ProjectTypes } from "@/common/types/project";
import { InviteMemberDto } from "./dto/project.dto";
import { MailService } from "../mail/mail.service";
import { randomString } from "@/common/utils";

@Controller("projects/:projectId/members")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProjectMemberController {
  constructor(
    private db: DbService,
    private project: ProjectService,
    private mail: MailService
  ) { }

  @Get('/')
  async getProjectMembers(
    @Param('projectId') projectId: string
  ) {
    return await this.project.getProjectMembers(projectId)
  }

  @Post('/invite')
  @ProjectManagerOrAboveRequired()
  async inviteMember(
    @Param('projectId') projectId: string,
    @Body() payload: InviteMemberDto,
    @ReqUser() owner: Payload
  ) {
    const project = await this.db.project.getById(projectId)
    if (!project) throw new HttpException(Messages.project.invalidProject, HttpStatus.NOT_FOUND)
    if (project.type === ProjectTypes.PERSONAL) {
      throw new HttpException(Messages.common.actionNotPermitted, HttpStatus.NOT_ACCEPTABLE)
    }
    const { user } = payload
    const userInvitting = await this.db.user.getById(user)
    if (!userInvitting) throw new HttpException(Messages.common.invalidUser, HttpStatus.NOT_FOUND)
    const memberExisting = await this.db.projectMember.findOne({
      project: projectId,
      user: userInvitting._id
    })
    if (memberExisting) throw new HttpException(Messages.project.alreadyMember, HttpStatus.BAD_REQUEST)
    const code = randomString()
    const newInvitation = await this.db.projectInvitation.create({
      project: projectId,
      code,
      user
    })
    console.log(project)
    await this.mail.sendInvitation(project, owner, userInvitting, newInvitation)
    return {
      message: Messages.project.invitedByEmail,
      status: HttpStatus.OK
    }
  }

  @Post('/join')
  async joinProject(
    @Param('projectId') projectId: string,
    @Query('code') code: string
  ) {
    const invitation = await this.db.projectInvitation.findOne({
      project: projectId,
      code
    })
    await this.project.addMember(projectId, invitation.user.toString(), ProjectRoles.MEMBER)
    return {
      message: Messages.project.joinedProject,
      status: HttpStatus.OK
    }
  }
}