import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('engineer/create')
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
  async createProjectManager(@Body() data: CreateUserDto) {
    return this.userService.createProjectManager(data);
  }
  @Post('login')
  async loginUser(@Body() data: LoginUserDto) {
    return this.userService.loginUser(data);
  }
}
