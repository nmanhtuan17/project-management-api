import { Messages } from "@/base/config";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";

export class GoogleDto {
  @ApiProperty({
    default: "example@gmail.com"
  })
  @IsEmail({}, {
    message: Messages.common.invalidEmail
  })
  @Transform(({ value }) => value.toString().toLowerCase())
  email: string;

  @ApiProperty({
    default: 'example'
  })
  fullName: string;
  @ApiProperty({
    default: 'example'
  })
  avatar: string;
  accessToken?: string;
}