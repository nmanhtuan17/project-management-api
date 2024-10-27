import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { SystemRoles } from "../types";

export const Roles = (...roles: SystemRoles[]): CustomDecorator => SetMetadata('roles', roles);
