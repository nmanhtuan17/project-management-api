import { DbService } from "@/base/db/services";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, Payload } from "../dto/auth.dto";
import { Messages } from "@/base/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    private db: DbService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('auth.jwt.secret'),
    });
  }

  public async validate(payload: JwtPayload): Promise<Payload> {
    const session = await this.db.session.getById(payload.sessionId);
    if (!session) throw new UnauthorizedException(Messages.auth.sessionExpired);
    if (new Date() > session.expirationDate) {
      await session.deleteOne();
      throw new UnauthorizedException(Messages.auth.sessionExpired);
    }
    return {
      userId: payload.sub,
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
