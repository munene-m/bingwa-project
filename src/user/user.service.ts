import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../modules/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}
  private logger = new Logger('User service');

  async createEngineer(data: Prisma.UserCreateInput) {
    this.logger.log('Create engineer');
    try {
      if (
        !data.email ||
        !data.password ||
        !data.firstName ||
        !data.lastName ||
        !data.phoneNumber ||
        !data.kraPin ||
        !data.address
      ) {
        throw new BadRequestException('Missing required fields');
      }
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      const existingKraPin = await this.prisma.user.findUnique({
        where: { kraPin: data.kraPin },
      });
      if (existingKraPin) {
        throw new ConflictException('KRA PIN must be unique');
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });

      const token = this.authService.generateAccessToken(user);
      return {
        token,
        message: 'Success. Engineer account created successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(error as string);
    }
  }
  async createAdmin(data: Prisma.UserCreateInput) {
    this.logger.log('Create admin');

    try {
      if (
        !data.email ||
        !data.password ||
        !data.firstName ||
        !data.lastName ||
        !data.phoneNumber ||
        !data.kraPin ||
        !data.address
      ) {
        throw new BadRequestException('Missing required fields');
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      const existingKraPin = await this.prisma.user.findUnique({
        where: { kraPin: data.kraPin },
      });
      if (existingKraPin) {
        throw new ConflictException('KRA PIN must be unique');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      const user = await this.prisma.user.create({
        data: {
          ...data,
          role: 'ADMIN',
          password: hashedPassword,
        },
      });
      const token = this.authService.generateAccessToken(user);

      return { token, message: 'Success. Admin created successfully.' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(error as string);
    }
  }
  async createProjectManager(data: Prisma.UserCreateInput) {
    this.logger.log('Create project manager');
    try {
      if (
        !data.email ||
        !data.password ||
        !data.firstName ||
        !data.lastName ||
        !data.phoneNumber ||
        !data.kraPin ||
        !data.address
      ) {
        throw new BadRequestException('Missing required fields');
      }
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      const existingKraPin = await this.prisma.user.findUnique({
        where: { kraPin: data.kraPin },
      });
      if (existingKraPin) {
        throw new ConflictException('KRA PIN must be unique');
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      const user = await this.prisma.user.create({
        data: {
          ...data,
          role: 'PROJECT_MANAGER',
          password: hashedPassword,
        },
      });
      const token = this.authService.generateAccessToken(user);
      return {
        token,
        message: 'Success. Project manager account created successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(error as string);
    }
  }
  async loginUser(data: LoginUserDto) {
    this.logger.log('Login user');
    try {
      if (!data.email || !data.password) {
        throw new BadRequestException('Missing required fields');
      }
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const isPasswordMatch = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (!isPasswordMatch) {
        throw new BadRequestException('Invalid password');
      }

      const token = this.authService.generateAccessToken(user);
      return { token, message: 'Success. User logged in successfully.' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error as string);
    }
  }
}
