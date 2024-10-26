import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private config: ConfigService) {}

  generateAccessToken(user: User): string {
    const token = sign(
      {
        userId: user.id.toString(),
        email: user.email,
        role: user.role,
      },
      this.config.get('JWT_SECRET'),
      {
        expiresIn: '10h',
        notBefore: '0',
        algorithm: 'HS256',
        audience: this.config.get('JWT_AUDIENCE'),
        issuer: this.config.get('JWT_ISSUER'),
      },
    );

    return token;
  }
}
