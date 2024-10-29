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

  @Put('assign/:projectId/:userId')
  @Roles(Role.ADMIN)
  async assignProject(
    @Param('projectId') projectId: number,
    @Param('userId') userId: number,
    @Body() body: { assignmentType: 'PROJECT_MANAGER' | 'ENGINEER' },
  ) {
    return this.projectService.assignProject(
      projectId,
      userId,
      body.assignmentType,
    );
  }
  @Get('project/:userId')
  @Roles(Role.ENGINEER, Role.PROJECT_MANAGER)
  async getAssignedProject(@Param('userId') userId: number) {
    return this.projectService.getAssignedProjects(userId);
  }
  @Delete(':projectId')
  @Roles(Role.ADMIN)
  async deleteProject(@Param('projectId') projectId: number) {
    return this.projectService.deleteProject(projectId);
  }
}
