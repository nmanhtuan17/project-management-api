import { Body, Controller, Get, HttpException, HttpStatus, Post } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/auth.dto";
import { UserService } from "../user/user.service";
import { Messages } from "@/base/config";
import { ApiError } from "@/common/errors/api.error";

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
    private authService: AuthService,
    private user: UserService
  ) {

  }

  @Post('login')
  login(): string {
    return this.authService.login()
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const newUser = await this.user.create(registerDto);
      await this.authService.sendVerificationEmail(newUser);
      return {
        data: { ...newUser.toJSON(), password: undefined },
        message: Messages.auth.registrationSuccess
      };
    } catch (e) {
      console.log(e)
      if (e instanceof ApiError) {
        throw new HttpException(e.message, e.getStatus());
      } else {
        throw new HttpException(Messages.common.unknownError, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
