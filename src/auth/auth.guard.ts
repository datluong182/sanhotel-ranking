import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  SetMetadata, UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { isArray } from "class-validator";
import * as console from "console";

@Injectable()
export class RolesGuard implements CanActivate {
  public static ROLES_KEY = "ROLES_KEY";

  public static hasRoles(...roles: string[]) {
    return SetMetadata(RolesGuard.ROLES_KEY, roles);
  }

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireRoles = this.reflector.getAllAndOverride<string[]>(
      RolesGuard.ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requireRoles) {
      return true;
    }
    const { roles } = context.switchToHttp().getRequest();
    if (!roles) {
      throw new UnauthorizedException();
    }
    return requireRoles.some((role) => roles.includes(role));
  }
}
