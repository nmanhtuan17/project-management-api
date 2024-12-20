import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-local';
import { AuthPayload } from '../dto/auth.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private auth: AuthService) {
    super();
  }

  public async validate(username: string, password: string): Promise<AuthPayload> {
    const user = await this.auth.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Wrong Username or Password');
    }

    const session = await this.auth.createSession(user);

    return {
      userId: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      sessionId: session._id.toString(),
    };
  }
}
