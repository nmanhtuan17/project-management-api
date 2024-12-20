import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Project, ProjectMember, User } from "@/base/db";
import Handlebars from "handlebars";
import { readFile } from "fs/promises";
import * as path from "node:path";
import { ServerClient, Message } from "postmark";
import { ProjectInvitation } from "@/base/db/models/project-invitation.schema";
import { AuthPayload } from "../auth/dto/auth.dto";

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
      HtmlBody: await this.renderEmail('auth/verify', {
        title: 'Verify account',
        link,
        code,
        fullName: user.fullName,
      }),
    });
  }

  async sendResetPassword(user: User, code: string) {
    const origin = this.config.get('webDomain');
    this.emailDomain = this.config.get('mail.domain');
    const link = `${origin}/auth/reset-password?code=${code}&email=${user.email}`
    return this.sendEmail({
      To: user.email,
      From: `noreply@${this.emailDomain}`,
      Subject: "Reset password",
      HtmlBody: await this.renderEmail('auth/reset-password', {
        title: 'Reset password request',
        link,
        code,
        fullName: user.fullName,
      }),
    });
  }

  async sendInvitation(
    project: Project,
    owner: AuthPayload,
    user: User,
    invitation: ProjectInvitation
  ) {
    const origin = this.config.get('webDomain');
    this.emailDomain = this.config.get('mail.domain');
    const link = `${origin}/projects/${project._id}/members/join?code=${invitation.code}`
    return this.sendEmail({
      To: user.internalEmail,
      From: `noreply@${this.emailDomain}`,
      Subject: 'Invitation to project',
      HtmlBody: await this.renderEmail('project/invitation', {
        title: 'Invitation to project',
        link,
        fullName: user.fullName,
      }),
    })
  }

  async sendEmail(data: Message) {
    const res = await this.client.sendEmail(data);
    return res
  }

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