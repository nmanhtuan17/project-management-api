import { DbService } from "@/base/db/services";
import { Controller, Get, Post, HttpStatus, UseGuards, Body, HttpException, UseInterceptors, UploadedFile } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ReqUser } from "@/common/decorators/req-user.decorator";
import { UserService } from "./user.service";
import { AuthPayload } from "../auth/dto/auth.dto";
import { ActiveEmailDto, UpdateProfileDto } from "./dto/user.dto";
import { Messages } from "@/base/config";
import { ConfigService } from "@nestjs/config";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "@/base/services/cloudinary.service";

@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('users')
export class UserController {
  constructor(
    private db: DbService,
    private user: UserService,
    private config: ConfigService,
    private cloudinaryService: CloudinaryService
  ) { }
  @Get('me')
  async getMe(
    @ReqUser() user: AuthPayload
  ) {
    return {
      data: await this.user.getById(user.userId),
      status: HttpStatus.OK
    }
  }

  @Post('/')
  async updateProfile(
    @ReqUser() user: AuthPayload,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return {
      data: await this.user.updateProfile(user.userId, updateProfileDto)
    }
  }

  @Post('/email/active')
  async activeEmail(
    @ReqUser() authPayload: AuthPayload,
    @Body() activeMailDto: ActiveEmailDto
  ) {
    const user = await this.db.user.getById(authPayload.userId)
    if (!!user.internalEmail) throw new HttpException(Messages.common.actionNotPermitted, HttpStatus.NOT_ACCEPTABLE)
    const internalEmail = `${activeMailDto.alias}@${this.config.get('mail.domain')}`
    const updated = await this.db.user.findByIdAndUpdate(authPayload.userId, {
      internalEmail
    })
    return {
      data: updated,
      message: Messages.member.emailAddressCreated
    }
  }

  @Post('/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @ReqUser() user: AuthPayload,
    @UploadedFile() file: Express.Multer.File
  ) {
    const uploaded = await this.cloudinaryService.uploadImage(file)
    const upadatedUser = await this.db.user.findByIdAndUpdate(user.userId, {
      avatar: uploaded
    })
    return {
      data: upadatedUser,
      message: Messages.member.profilePictureUpdated
    }
  }
}