import { Messages } from "@/base/config";
import { ReqUser } from "@/common/decorators/req-user.decorator";
import { AuthPayload } from "@/modules/auth/dto/auth.dto";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { DeviceTokenDto, NotiDto } from "@/modules/notification/dto";
import { NotificationService } from "@/modules/notification/notification.service";
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@Controller('notification')
@ApiTags('notification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private noti: NotificationService
  ) {

  }

  @Post('/register')
  async registerToken(
    @ReqUser() user: AuthPayload,
    @Body() payload: DeviceTokenDto
  ) {
    await this.noti.registerToken(payload.fcmToken, user.sessionId)
    return { message: 'Token registered successfully' };
  }

  @Post('/push')
  async pushNotification(
    @ReqUser() user: AuthPayload,
    @Body() payload: NotiDto
  ) {
    await this.noti.sendNotification(user.userId, payload)
    return {
      message: 'Success'
    }
  }

  @Get('/')
  async getNotifications(
    @ReqUser() user: AuthPayload
  ){
    return {
      data: await this.noti.getNotifications(user.userId),
      message: Messages.common.success
    }
  }
}

