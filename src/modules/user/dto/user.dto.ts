import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, Length, Matches } from "class-validator";

export class UpdateProfileDto {
  @ApiProperty({
    default: 'example'
  })
  @IsNotEmpty({
    message: 'MANE_IS_REQUIRED'
  })
  fullName: string

  @ApiProperty({
    default: 'example'
  })
  bio?: string
}

export class ActiveEmailDto {
  @ApiProperty({
    default: 'example',
    description: 'Alias must be 5-15 characters long and contain only letters, numbers, and underscores.',
  })
  @IsNotEmpty()
  @Length(5, 15, { message: 'Alias must be between 5 and 15 characters.' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Alias can only contain letters, numbers, and underscores.',
  })
  alias: string
}