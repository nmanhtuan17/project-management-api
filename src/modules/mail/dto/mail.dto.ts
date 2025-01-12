import { EmailType } from "@/common/types";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

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