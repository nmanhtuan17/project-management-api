import { Messages } from "@/base/config";
import { ProjectTypes } from "@/common/types/project";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateProjectDto {
  @ApiProperty({
    default: 'example'
  })
  @IsNotEmpty({
    message: 'PROJECT_NAME_IS_REQUIRED'
  })
  name: string

  @ApiProperty()
  @IsNotEmpty({
    message: 'SLUG_IS_EMPTY'
  })
  slug: string

  @ApiProperty({
    default: 'team'
  })
  @IsNotEmpty({
    message: 'SLUG_IS_EMPTY'
  })
  type: ProjectTypes
}

export class InviteMemberDto {
  @ApiProperty({
    default: "example@gmail.com"
  })
  @IsEmail({}, {
    message: Messages.common.invalidEmail
  })
  @Transform(({ value }) => value.toString().toLowerCase())
  email: string
}

export class VerifySlugDto {
  @ApiProperty({
    default: 'example'
  })
  @IsNotEmpty({
    message: 'SLUG_IS_EMPTY'
  })
  slug: string;
}

export class CreateColumnDto {
  @ApiProperty({
    default: 'new_column'
  })
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    default: 'New Column'
  })
  @IsNotEmpty()
  title: string;
}
