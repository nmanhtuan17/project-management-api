import { DbService } from "@/base/db/services";
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ProjectService } from "./project.service";
import { ReqUser } from "@/common/decorators/req-user.decorator";
import { AuthPayload } from "../auth/dto/auth.dto";
import { ProjectManagerOrAboveRequired, ProjectOwnerRequired } from "./decorators/project.decorator";
import { Messages } from "@/base/config";
import { ProjectRoles, ProjectTypes } from "@/common/types/project";
import { InviteMemberDto } from "./dto/project.dto";
import { MailService } from "../mail/mail.service";
import { randomString } from "@/common/utils";
import { NotificationService } from "@/modules/notification/notification.service";
import { NotiType } from "@/common/types/notification";

@Controller("projects/:projectId/members")
@ApiTags('project')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProjectMemberController {
  constructor(
    private db: DbService,
    private project: ProjectService,
    private mail: MailService,
    private noti: NotificationService
  ) { }

  @Get('/')
  async getProjectMembers(
    @Param('projectId') projectId: string
  ) {
    return await this.project.getProjectMembers(projectId)
  }

  @Get('/profile')
  async getProjectMember(
    @Param('projectId') projectId: string,
    @ReqUser() user: AuthPayload
  ) {
    return await this.project.getProjectMember(projectId, user.userId)
  }

  @Post('/invite')
  @ProjectManagerOrAboveRequired()
  async inviteMember(
    @Param('projectId') projectId: string,
    @Body() payload: InviteMemberDto,
    @ReqUser() owner: AuthPayload
  ) {
    const project = await this.db.project.getById(projectId)
    if (!project) throw new HttpException(Messages.project.invalidProject, HttpStatus.NOT_FOUND)
    if (project.type === ProjectTypes.PERSONAL) {
      throw new HttpException(Messages.common.actionNotPermitted, HttpStatus.NOT_ACCEPTABLE)
    }
    const { email } = payload
    const userInvitting = await this.db.user.findOne({
      internalEmail: email
    })
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
      user: userInvitting._id.toString()
    })
    await this.mail.sendInvitation(project, owner, userInvitting, newInvitation)
    await this.noti.sendNotification(userInvitting._id.toString(),
      { title: Messages.notification.newEmail, body: `Bạn có email mới` })
    await this.noti.createNotification({
      user: userInvitting._id.toString(),
      title: Messages.notification.newTask,
      body: 'Bạn có email mới',
      type: NotiType.EMAIL
    })
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
    if (!invitation) throw new HttpException(Messages.project.invalidCode, HttpStatus.NOT_FOUND)
    await this.project.addMember(projectId, invitation.user.toString(), ProjectRoles.MEMBER)
    return {
      message: Messages.project.joinedProject,
      status: HttpStatus.OK
    }
  }

  @Post('/:memberId/role')
  @ProjectManagerOrAboveRequired()
  async updateRole(
    @Param('memberId') memberId: string,
    @Body() payload: { role: ProjectRoles }
  ) {
    const member = await this.db.projectMember.getById(memberId)
    if (member.role === ProjectRoles.OWNER) {
      throw new HttpException(Messages.common.actionNotPermitted, HttpStatus.NOT_ACCEPTABLE)
    } else {
      member.role = payload.role
      await member.save()
    }
    return {
      data: member,
      message: Messages.common.updated
    }
  }

  @Delete('/:memberId')
  @ProjectOwnerRequired()
  async removeMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string
  ) {
    const member = await this.db.projectMember.getById(memberId)
    if (member.role === ProjectRoles.OWNER) {
      throw new HttpException(Messages.common.actionNotPermitted, HttpStatus.NOT_ACCEPTABLE)
    } else {
      const removeMember = await this.project.removeMember(projectId, memberId);
      return {
        data: removeMember,
        message: Messages.common.updated
      }
    }
  }
}