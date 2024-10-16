import { AuthService } from "@/modules/auth/auth.service";
import { Controller, Get, Post } from "@nestjs/common";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {

  }

  @Post('login')
  login(): string {
    return this.authService.login()
  }

  @Post('register')
  register() {

  }
}
