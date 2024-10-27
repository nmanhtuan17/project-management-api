import { ProjectTypes } from "@/common/types/project";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

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
    default: '671dfbc3e7754b7b57a93e15'
  })
  @IsNotEmpty()
  user: string
}
