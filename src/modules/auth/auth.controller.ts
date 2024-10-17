import { Body, Controller, Get, HttpException, HttpStatus, Post } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./auth.dto";
import { UserService } from "../user/user.service";

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {

  }

  @Post('login')
  login(): string {
    return this.authService.login()
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const newUser = this.userService.create(registerDto)

    return {
      data: {...newUser, password: undefined}
    }
  }
}
