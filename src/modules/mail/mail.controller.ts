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
export class MailController {
  constructor(
    private db: DbService,
    private mailService: MailService
  ) { }

  @Post('/postmark-inbound')
  async receiveEmail(
    @Body() payload: any
  ) {
    console.log(payload)
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
  @UseGuards(JwtAuthGuard)
  async sendEmail(
    @ReqUser() user: AuthPayload,
    @Body() data: SendMailDto
  ) {
    const sender = await this.db.user.getById(user.userId)
    const res = await this.mailService.sendEmail(data)
    return {
      data: res,
      message: res.Message
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
    return {
      data: await this.mailService.getOutboundMessageDetails(messageId)
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
    return {
      data: await this.mailService.getInboundMessageDetails(messageId)
    }
  }


}