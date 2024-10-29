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
import { UpdateUserDto } from './dto/update-user.dto';

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
        this.logger.log('User not found');
        throw new BadRequestException('Invalid credentials');
      }
      const isPasswordMatch = await bcrypt.compare(
        data.password,
        user.password,
      );
      if (!isPasswordMatch) {
        throw new BadRequestException('Invalid credentials');
      }

      const token = this.authService.generateAccessToken(user);
      return {
        token,
        user: {
          id: user.id,
          role: user.role,
          username: `${user.firstName} ${user.lastName}`,
        },
        message: 'Success. User logged in successfully.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error as string);
    }
  }
  async getUserById(id: number) {
    this.logger.log('Get user by ID');
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: Number(id) },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          address: true,
          kraPin: true,
          role: true,
        },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.log(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error as string);
    }
  }
  async getAllUsers() {
    this.logger.log('Get all users');
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          address: true,
          kraPin: true,
          role: true,
        },
      });
      return users;
    } catch (error) {
      this.logger.log(error);
      throw new InternalServerErrorException(error as string);
    }
  }
  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    this.logger.log('Update user');
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }
      let hashedPassword: string;
      if (updateUserDto.password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(updateUserDto.password, saltRounds);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: Number(id) },
        data: {
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
          email: updateUserDto.email,
          phoneNumber: updateUserDto.phoneNumber,
          password: hashedPassword,
          address: updateUserDto.address,
          kraPin: updateUserDto.kraPin,
          role:updateUserDto.role
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          address: true,
          kraPin: true,
          role: true,
        },
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Could not update user');
    }
  }
  async deleteUser(id: number) {
    this.logger.log('Delete user');
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: Number(id) },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.prisma.user.delete({ where: { id: Number(id) } });
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Unable to delete user');
    }
  }
}
