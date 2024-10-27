import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CheckRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('Missing or invalid token');
    }

    // Step 2: Extract the token and verify it
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
      decodedToken = verify(token, this.config.get('JWT_SECRET') as string);
    } catch (error) {
      throw new ForbiddenException('Invalid token');
    }

    const user = await this.userService.getUserById(decodedToken.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.role) {
      throw new ForbiddenException('User has no role');
    }

    if (requiredRoles.includes(user.role)) {
      return true;
    } else {
      throw new ForbiddenException(
        `Not enough permissions. User role is ${user.role}`,
      );
    }
  }
}
