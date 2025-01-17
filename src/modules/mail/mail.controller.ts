import { DbService } from "@/base/db/services";
import { ReqUser } from "@/common/decorators/req-user.decorator";
import { AuthPayload } from "@/modules/auth/dto/auth.dto";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Request, UseGuards } from "@nestjs/common";
import { MailService } from "./mail.service";
import { Messages } from "@/base/config";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SendMailDto } from "./dto/mail.dto";
import { Message } from "postmark";

@Controller("mails")
@ApiTags('mail')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MailController {
  constructor(
    private db: DbService,
    private mailService: MailService
  ) { }

  @Post('/postmark-inbound')
  @UseGuards()
  async receiveEmail(
    @Body() payload: any
  ) {
    console.log(payload)
    return {
      data: payload
    }
  }

  @Post('/postmark-outbound')
  @UseGuards()
  async outboundEmail(
    @Body() payload: any
  ) {

    console.log(payload)
    return {
      data: payload
    }
  }

  @Get('')
  async getEmails(
    @ReqUser() user: AuthPayload
  ) {

    return {
      data: await this.db.email.find({ owner: user.userId }),
      message: ''
    }
  }

  @Post('send')
  async sendEmail(
    @ReqUser() user: AuthPayload,
    @Body() data: Message
  ) {
    const sender = await this.db.user.getById(user.userId)
    const res = await this.mailService.sendEmail({
      ...data,
      From: sender.internalEmail,
      To: data.To,
      Subject: data.Subject,
      HtmlBody: data.HtmlBody
    })

    console.log(res)

    return {
      data: res,
      message: res.Message
    }
  }

  @Get('outbounds')
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

  @Get('outbound/:messageId')
  async getOutboundMessageDetails(
    @Param('messageId') messageId: string
  ) {
    return {
      data: await this.mailService.getOutboundMessageDetails(messageId)
    }
  }

  @Get('inbounds')
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

  @Get('inbound/:messageId')
  async getInboundMessageDetails(
    @Param('messageId') messageId: string
  ) {
    return {
      data: await this.mailService.getInboundMessageDetails(messageId)
    }
  }


}