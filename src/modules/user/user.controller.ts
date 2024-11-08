import { DbService } from "@/base/db/services";
import { Controller, Get, HttpStatus, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ReqUser } from "@/common/decorators/req-user.decorator";
import { UserService } from "./user.service";
import { Payload } from "../auth/dto/auth.dto";

@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('users')
export class UserController {
  constructor(
    private db: DbService,
    private user: UserService
  ) { }
  @Get('me')
  async getMe(
    @ReqUser() user: Payload
  ) {
    return {
      data: await this.user.getById(user.userId),
      status: HttpStatus.OK
    }
  }
}