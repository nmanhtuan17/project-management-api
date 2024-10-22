import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Mailgun, { MailgunMessageData } from "mailgun.js";
import * as FormData from 'form-data';
import { IMailgunClient } from "mailgun.js/Interfaces";
import { User } from "@/base/db";
import Handlebars from "handlebars";
import { readFile } from "fs/promises";
import * as path from "node:path";
import { ServerClient, Message } from "postmark";

@Injectable()
export class MailService {
  client: ServerClient;
  emailDomain: string = ''

  constructor(
    private config: ConfigService
  ) {
    this.client = new ServerClient(config.get('mail.mailgunKey'))
  }

  async sendUserVerification(user: User, code: string) {
    const origin = this.config.get('webDomain');
    this.emailDomain = this.config.get('mail.domain');
    const link = `${origin}/auth/verify?code=${code}&email=${user.email}`;
    return this.sendEmail({
      From: `noreply@${this.emailDomain}`,
      To: user.email,
      Subject: "Please verify your account",
      HtmlBody: `<p>${code}</p>`
    });
  }

  async sendEmail(data: Message) {
    const res = await this.client.sendEmail(data);
    return res
  }

  // async sendMail(data: MailgunMessageData) {
  //   const res = await this.client.messages.create(this.emailDomain, data);
  //   if(res.status !== 200){
  //     throw new Error("Failed to send email.");
  //   }
  //   return res;
  // }


  private async renderEmail<T>(templateName: string, data: T) {
    const templateContent = await this.loadTemplate(templateName);
    const template = Handlebars.compile(templateContent);
    return template(data);
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const filePath = path.join(__dirname, 'templates', `${templateName.replace('.hbs', '')}.hbs`);
    return await readFile(filePath, 'utf-8');
  }

}