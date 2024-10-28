import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { LoginUserDto } from './dto/login-user.dto';
import { CheckRoleGuard } from 'src/common/guards/check-role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(CheckRoleGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post('engineer/create')
  // @Roles(Role.ADMIN)
  async createUser(@Body() data: CreateUserDto) {
    return this.userService.createEngineer(data);
  }
  @Post('admin/create')
  async createAdmin(@Body() data: CreateUserDto) {
    const result = await this.userService.createAdmin(data);

    if ('error' in result) {
      // Handle the error response
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: result.error,
      };
    }

    return {
      statusCode: HttpStatus.CREATED,
      user: result,
    };
  }
  @Post('project-manager/create')
  // @Roles(Role.ADMIN)
  async createProjectManager(@Body() data: CreateUserDto) {
    return this.userService.createProjectManager(data);
  }
  @Post('login')
  async loginUser(@Body() data: LoginUserDto) {
    return this.userService.loginUser(data);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  async getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }
  @Get('')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Put('edit/:id')
  @Roles(Role.ADMIN)
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteUser(@Param('id') id: number) {
    return this.userService.deleteUser(id);
  }
}
