import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { PrismaModule } from '../modules/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../modules/prisma.service';
import { ProjectController } from './project.controller';
import { UserModule } from 'src/user/user.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [PrismaModule, AuthModule, UserModule],
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService,ConfigService],
  exports: [ProjectService],
})
export class ProjectModule {}
