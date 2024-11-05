import { DbService } from "@/base/db/services";
import { Body, Controller, Post, Request } from "@nestjs/common";

@Controller("mails")
export class MailController {
  constructor(
    private db: DbService
  ) {}

  @Post('/postmark-webhook')
  async receiveEmail (
    @Body() payload: any
  ) {
    await this.db.email.create(payload)
    console.log(payload)
    return {
      data: payload
    }
  }
}