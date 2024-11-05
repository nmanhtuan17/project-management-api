import { DbService } from "@/base/db/services";
import { Controller, Post, Request } from "@nestjs/common";

@Controller("mails")
export class MailController {
  constructor(
    private db: DbService
  ) {}

  @Post('/postmark-webhook')
  async receiveEmail (
    @Request() req
  ) {
    await this.db.email.create(req.body)
    console.log(req.body)
    return {
      message: ""
    }
  }
}