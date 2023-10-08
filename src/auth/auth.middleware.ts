import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Logger } from "nestjs-pino";
import { StaffRepository } from "src/staff/staff.repository";
import { JwtPayload } from "./auth.type";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly AUTH_HEADER = "authorization";
  private readonly secret: string;

  constructor(
    private readonly logger: Logger,
    private readonly staffRepo: StaffRepository,
    private readonly jwtService: JwtService,
  ) {
    this.secret = process.env.JWT_SECRET;
  }

  async use(req: any, res: any, next: (error?: any) => void) {
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      this.logger.log("Not token found!");
      return next();
    }
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: this.secret,
      });
      const staff = await this.staffRepo.findFirstStaffByStaffId(
        payload.staffId,
      );
      req.user = payload;
      req.role = staff.role;
      this.logger.log(payload, "User authenticated");
    } catch (ex) {
      this.logger.error(ex);
      throw new UnauthorizedException(ex);
    }
    next();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
