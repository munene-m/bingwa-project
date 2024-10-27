import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/modules/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/modules/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, ConfigService],
  exports: [UserService],
})
export class UserModule {}
