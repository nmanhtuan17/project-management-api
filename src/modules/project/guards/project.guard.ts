import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ProjectService } from "../project.service";
import { PROJECT_PERMISSIONS_KEY } from "../decorators/project.decorator";
import { AuthPayload } from "@/modules/auth/dto/auth.dto";
import { Messages } from "@/base/config";
import { ProjectRoles } from "@/common/types/project";

@Injectable()
export class ProjectPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private projectService: ProjectService
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<ProjectRoles[]>(PROJECT_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user }: { user: AuthPayload } = request;
    const { projectId } = request.params;

    const member = await this.projectService.getProjectMember(projectId, user.userId);

    if (!member || !requiredPermissions.includes(member.role)) {
      throw new UnauthorizedException(Messages.common.actionNotPermitted);
    }

    return true;
  }
}
