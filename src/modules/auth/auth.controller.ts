import { AuthService, RegisterDto } from "@/modules/auth";
import { Body, Controller, Get, HttpException, HttpStatus, Post } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
    private authService: AuthService
  ) {

  }

  @Post('login')
  login(): string {
    return this.authService.login()
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {

  }
}
