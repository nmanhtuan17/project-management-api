import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class VerifyUserDto {
  @IsNotEmpty({
    message: "EMAIL_REQUIRED"
  })
  @IsEmail({}, {
    message: "INVALID_EMAIL"
  })
  @ApiProperty({
    type: String,
    default: "example@gmail.com"
  })
  @Transform(({ value }) => value.toString().toLowerCase())
  email: string;

  @IsNotEmpty({
    message: "CODE_REQUIRED"
  })
  @IsString({
    message: "INVALID_CODE"
  })
  @ApiProperty({
    type: String,
    default: "123456"
  })
  code: string;
}