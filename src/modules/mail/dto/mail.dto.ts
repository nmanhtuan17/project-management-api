import { Messages } from "@/base/config";
import { EmailType } from "@/common/types";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Message } from "postmark";

export class ReceiveEmailDto {
  @ApiProperty({})
  @IsString()
  From: string

  @ApiProperty({})
  @IsString()
  FromName: string

  @ApiProperty({})
  @IsString()
  To: string

  @ApiProperty({})
  @IsString()
  OriginalRecipient: string

  @ApiProperty({})
  @IsString()
  @IsOptional()
  Cc?: string

  @ApiProperty({})
  @IsString()
  @IsOptional()
  Bcc?: string

  @ApiProperty()
  MessageId: string;

  @ApiProperty()
  MessageStream: EmailType;

  @ApiProperty({

  })
  Attachments?: any


}


export class SendMailDto extends Message {
  @ApiProperty({
    default: "example@gmail.com"
  })
  @IsEmail({}, {
    message: Messages.common.invalidEmail
  })
  @Transform(({ value }) => value.toString().toLowerCase())
  From: string

  @ApiProperty({
    default: "example@gmail.com"
  })
  To: string

  @ApiProperty({
    default: "example@gmail.com"
  })
  @IsOptional()
  Cc?: string

  @ApiProperty({
    default: "example@gmail.com"
  })
  @IsOptional()
  Bcc?: string

  @ApiProperty({
    default: "example@gmail.com"
  })
  @IsOptional()
  ReplyTo?: string;

  @ApiProperty({
    default: 'this is subject'
  })
  @IsNotEmpty()
  Subject: string

  @ApiProperty({
    default: '<p>This is body</p>'
  })
  @IsNotEmpty()
  HtmlBody: string
}