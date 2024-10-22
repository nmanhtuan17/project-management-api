import { Body, Controller, Get, HttpException, HttpStatus, Post, UnauthorizedException } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
import { UserService } from "../user/user.service";
import { Messages } from "@/base/config";
import { ApiError } from "@/common/errors/api.error";
import { DbService } from "@/base/db/services";
import { VerifyUserDto } from "@/modules/auth/dto/verify.dto";
import { ConfigService } from "@nestjs/config";

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
    private db: DbService,
    private authService: AuthService,
    private user: UserService,
    private config: ConfigService
  ) {

  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException(Messages.auth.wrongEmailPassword);
    // Check for email verification
    if (!this.config.get("auth.ignoreMailVerification") && !user.emailVerified) {
      throw new HttpException(Messages.auth.emailNotVerified, HttpStatus.FORBIDDEN);
    }
    const newSession = await this.authService.createSession(user, "web");
    return {
      message: Messages.auth.loginSuccess,
      data: this.authService.signUser(user, newSession._id.toString()),
      status: HttpStatus.OK
    };
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

  @Post("verify")
  public async verifyAccount(
    @Body() info: VerifyUserDto
  ) {
    const { email, code } = info;
    const user = await this.db.user.findOne({ email });
    if (!user) throw new ApiError(Messages.common.invalidEmail, HttpStatus.BAD_REQUEST);
    const verificationCode = await this.db.verificationCode.findOne({
      user: user._id,
      code
    });
    if (!verificationCode) return false;
    await user.save();
    return {
      message: "EMAIL_VERIFIED",
      status: HttpStatus.OK
    };
  }
}
