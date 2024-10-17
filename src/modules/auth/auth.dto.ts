import { Messages } from "@/base/config";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class RegisterDto {
  @ApiProperty({
    default: "example@gmail.com"
  })
  @IsEmail({}, {
    message: Messages.common.invalidEmail
  })
  @Transform(({ value }) => value.toString().toLowerCase())
  email: string;

  @ApiProperty({
    default: "John Doe"
  })
  @IsString({
    message: Messages.common.invalidName
  })
  @IsNotEmpty({
    message: Messages.common.nameRequired
  })
  fullName: string;

  @ApiProperty({
    default: "P@ssword~sample1"
  })
  @IsNotEmpty({
    message: "PASSWORD_REQUIRED"
  })
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minSymbols: 0,
    minLowercase: 0,
    minUppercase: 0
  }, {
    message: "PASSWORD_TOO_WEAK"
  })
  password: string;
}