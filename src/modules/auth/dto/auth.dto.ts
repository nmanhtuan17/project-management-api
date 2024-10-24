import { Messages } from "@/base/config";
import { SystemRoles } from "@/common/types";
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

export class LoginDto {
  @ApiProperty({
    default: "example@gmail.com"
  })
  @IsEmail({}, {
    message: Messages.common.invalidEmail
  })
  @Transform(({ value }) => value.toString().toLowerCase())
  email: string;

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

export interface Payload {
  userId: string;
  fullName: string;
  email: string;
  role: SystemRoles;
  sessionId: string;
}

export interface JwtSign {
  access_token: string;
  refresh_token: string;
}

export interface JwtPayload {
  sub: string;
  fullName: string;
  email: string;
  role: SystemRoles;
  sessionId: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    default: "example@gmail.com"
  })
  @IsEmail({}, {
    message: Messages.common.invalidEmail
  })
  @Transform(({ value }) => value.toString().toLowerCase())
  email: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    default: "P@ssword~sample1"
  })
  @IsNotEmpty({
    message: "OLD_PASSWORD_REQUIRED"
  })
  oldPassword: string;

  @ApiProperty({
    default: "P@ssword~sample1"
  })
  @IsNotEmpty({
    message: "NEW_PASSWORD_REQUIRED"
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
  newPassword: string;

  @ApiProperty({
    default: "P@ssword~sample1"
  })
  @IsNotEmpty({
    message: "CONFIRM_PASSWORD_REQUIRED"
  })
  confirmPassword: string;
}