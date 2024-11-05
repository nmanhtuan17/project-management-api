import { Controller, Post, Request } from "@nestjs/common";

@Controller("mails")
export class MailController {
  @Post('/postmark-webhook')
  async receiveEmail (
    @Request() req
  ) {

    console.log(req.body)
    return {
      message: ""
    }
  }
}