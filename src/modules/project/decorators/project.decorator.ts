import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { ProjectRoles } from "@/common/types/project";
import { ProjectPermissionGuard } from "../guards/project.guard";

export const PROJECT_PERMISSIONS_KEY = "projectPermissions";
export const ProjectPermission = (...permissions: string[]) => {
  return applyDecorators(
    SetMetadata(PROJECT_PERMISSIONS_KEY, permissions),
    UseGuards(ProjectPermissionGuard)
  );
};

export const ProjectOwnerRequired = () => ProjectPermission(ProjectRoles.OWNER);
export const ProjectManagerOrAboveRequired = () => ProjectPermission(ProjectRoles.OWNER, ProjectRoles.MANAGER);
export const ProjectMemberRequired = () => ProjectPermission(ProjectRoles.OWNER, ProjectRoles.MANAGER, ProjectRoles.MEMBER);
