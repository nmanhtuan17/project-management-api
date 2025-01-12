import { DbService } from "@/base/db/services";
import { Body, Controller, Post, Request } from "@nestjs/common";

@Controller("mails")
export class MailController {
  constructor(
    private db: DbService
  ) { }

  @Post('/postmark-webhook')
  async receiveEmail(
    @Body() payload: any
  ) {
    let { Attachments, mail } = payload
    if (payload.Attachments) {

    }
    await this.db.email.create(mail)
    console.log(payload)
    return {
      data: payload
    }
  }
}