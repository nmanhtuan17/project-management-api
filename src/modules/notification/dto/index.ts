import { NotiType } from "@/common/types/notification";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class DeviceTokenDto {
  @ApiProperty({
    type: String
  })
  @IsString()
  fcmToken: string
}

export class NotiDto {
  @ApiProperty({
    type: String
  })
  @IsString()
  title: string

  @ApiProperty({
    type: String
  })
  @IsString()
  body: string
}

export class NofiticationDto {
  @ApiProperty({
    type: String
  })
  @IsString()
  user: string

  @ApiProperty({
    type: String
  })
  @IsString()
  title: string

  @ApiProperty({
    type: String
  })
  @IsString()
  body: string

  @ApiProperty({
    type: String
  })
  @IsString()
  task?: string

  @ApiProperty({
    type: NotiType
  })
  @IsString()
  type: NotiType

}