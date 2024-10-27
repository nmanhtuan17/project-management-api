import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  public canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[] | undefined>('roles', [
      context.getHandler(),
      context.getClass()
    ])

    if (!roles) {
      return true
    }

    let request = context.switchToHttp().getRequest();
    const { user } = request
    if (!user) {
      return false
    }

    return roles.includes(user.role)
  }
}