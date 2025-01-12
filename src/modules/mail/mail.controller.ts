import { DbService } from "@/base/db/services";
import { ReqUser } from "@/common/decorators/req-user.decorator";
import { AuthPayload } from "@/modules/auth/dto/auth.dto";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { ReceiveEmailDto } from "@/modules/mail/dto/mail.dto";
import { Body, Controller, Get, HttpException, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Controller("mails")
export class MailController {
  constructor(
    private db: DbService
  ) { }

  @Post('/postmark-inbound')
  async receiveEmail(
    @Body() payload: any
  ) {
    let { Attachments, ...mail } = payload
    console.log(mail)
    const owner = await this.db.user.findOne({ internalEmail: mail.OriginalRecipient })
    if (!owner) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }
    await this.db.email.create({ ...mail, owner: owner._id.toString() })
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
}