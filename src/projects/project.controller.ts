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
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CheckRoleGuard } from '../common/guards/check-role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateProjectDto } from './dto/update-project-dto';

@Controller('projects')
@UseGuards(CheckRoleGuard)
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post('create')
  @Roles(Role.ADMIN)
  async createProject(@Body() data: CreateProjectDto) {
    return this.projectService.createProject(data);
  }
  @Get()
  @Roles(Role.ADMIN)
  async getAllProjects() {
    return this.projectService.getProjects();
  }
  @Put(':id')
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  async updateProject(@Param('id') id: number, @Body() data: UpdateProjectDto) {
    return this.projectService.updateProject(id, data);
  }

  @Put('assign/:projectId/:projectManagerId')
  @Roles(Role.ADMIN)
  async assignProject(
    @Param('projectId') projectId: number,
    @Param('projectManagerId') projectManagerId: number,
  ) {
    return this.projectService.assignProject(projectId, projectManagerId);
  }
}
