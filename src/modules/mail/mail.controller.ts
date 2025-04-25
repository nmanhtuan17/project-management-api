import { DbService } from "@/base/db/services";
import { ReqUser } from "@/common/decorators/req-user.decorator";
import { AuthPayload } from "@/modules/auth/dto/auth.dto";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Request, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { MailService } from "./mail.service";
import { Messages } from "@/base/config";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SendMailDto } from "./dto/mail.dto";
import { Attachment, Message } from "postmark";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { StorageService } from "@/base/services";
import { file } from "googleapis/build/src/apis/file";
import { NotificationService } from "@/modules/notification/notification.service";
import { NotiType } from "@/common/types/notification";

@Controller("mails")
@ApiTags('mail')
@ApiBearerAuth()
export class MailController {
  constructor(
    private db: DbService,
    private mailService: MailService,
    private storage: StorageService,
    private noti: NotificationService
  ) { }

  @Post('/postmark-inbound')
  async receiveEmail(
    @Body() payload: any
  ) {
    console.log(payload)
    for (let email of payload.ToFull) {
      const user = await this.db.user.findOne({
        internalEmail: email
      })
      if (user) {
        await this.noti.sendNotification(user._id.toString(), {
          title: Messages.notification.newEmail,
          body: `Bạn nhận được email từ ${payload.from}`
        })
        await this.noti.createNotification({
          user: user._id.toString(),
          title: Messages.notification.newEmail,
          body: `Bạn nhận được email từ ${payload.from}`,
          type: NotiType.EMAIL,
          email: payload.MessageId
        })
      }
    }
    return {
      data: payload
    }
  }

  @Post('/postmark-outbound')
  async outboundEmail(
    @Body() payload: any
  ) {

    console.log(payload)
    return {
      data: payload
    }
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getEmails(
    @ReqUser() user: AuthPayload
  ) {

    return {
      data: await this.db.email.find({ owner: user.userId }),
      message: ''
    }
  }

  @Post('send')
  @UseInterceptors(FilesInterceptor('files'))
  @UseGuards(JwtAuthGuard)
  async sendEmail(
    @ReqUser() user: AuthPayload,
    @Body() data: SendMailDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    try {
      const res = await this.mailService.sendEmail(data, files)
      const attachments = await Promise.all(files.map(file => this.storage.uploadEmailAttachment(file, res.MessageID)))
      return {
        data: res,
        message: res.Message
      }
    } catch (error) {
      console.log(error)
      throw new HttpException('Send email failed', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('outbounds')
  @UseGuards(JwtAuthGuard)
  async getOutboundMessages(
    @ReqUser() user: AuthPayload
  ) {
    const sender = await this.db.user.getById(user.userId)
    const res = await this.mailService.getOutboundMessages({ fromEmail: sender.internalEmail })
    return {
      data: {
        total: res.TotalCount,
        messages: res.Messages
      }
    }
  }

  @Get('outbounds/:messageId')
  @UseGuards(JwtAuthGuard)
  async getOutboundMessageDetails(
    @Param('messageId') messageId: string
  ) {
    const attachments = await this.db.emailAttachment.find({ messageID: messageId })
    const message = await this.mailService.getOutboundMessageDetails(messageId)
    return {
      data: {
        ...message,
        Attachments: attachments
      }
    }
  }

  @Get('inbounds')
  @UseGuards(JwtAuthGuard)
  async getInboundMessages(
    @ReqUser() user: AuthPayload
  ) {
    const sender = await this.db.user.getById(user.userId)
    const res = await this.mailService.getInboundMessages({ recipient: sender.internalEmail })
    return {
      data: {
        total: res.TotalCount,
        messages: res.InboundMessages
      }
    }
  }

  @Get('inbounds/:messageId')
  @UseGuards(JwtAuthGuard)
  async getInboundMessageDetails(
    @Param('messageId') messageId: string
  ) {
    const attachments = await this.db.emailAttachment.find({ messageID: messageId })
    const message = await this.mailService.getInboundMessageDetails(messageId)
    return {
      data: {
        ...message,
        Attachments: attachments
      }
    }
  }

}