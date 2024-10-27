import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateProjectDto } from './dto/update-project-dto';
import { PrismaService } from '../modules/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { Role } from '@prisma/client';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}
  private logger = new Logger('Project service');

  async createProject(data: CreateProjectDto) {
    this.logger.log('Create project');
    if (!data.name || !data.description || !data.startDate || !data.endDate) {
      throw new BadRequestException('Missing required fields');
    }
    try {
      return await this.prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
      });
    } catch (error) {
      // this.logger.log(error);
      if (error.code === 'P2002') {
        throw new ConflictException('Project already exists');
      } else if (error instanceof BadRequestException) {
        throw error;
      } else if (error instanceof PrismaClientValidationError) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
  async getProjects() {
    this.logger.log('Get all projects');
    try {
      const projects = await this.prisma.project.findMany();
      return projects;
    } catch (error) {
      throw new InternalServerErrorException('Unable to get projects');
    }
  }
  async updateProject(id: number, data: UpdateProjectDto) {
    this.logger.log('Update project');
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: Number(id) },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      const updatedProject = await this.prisma.project.update({
        where: { id: Number(id) },
        data,
      });
      return { message: 'Project updated successfully', updatedProject };
    } catch (error) {
      if (error instanceof PrismaClientValidationError) {
        throw new BadRequestException({ message: error.message });
      } else if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }
  async assignProject(
    projectId: number,
    userId: number,
    assignmentType: 'PROJECT_MANAGER' | 'ENGINEER',
  ) {
    if (!['PROJECT_MANAGER', 'ENGINEER'].includes(assignmentType)) {
      throw new BadRequestException('Invalid assignment type');
    }
    this.logger.log(`Assign ${assignmentType?.toLowerCase()} to project`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: Number(userId) },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }
      const expectedRole =
        assignmentType === 'PROJECT_MANAGER'
          ? Role.PROJECT_MANAGER
          : Role.ENGINEER;
      if (user.role !== expectedRole) {
        throw new BadRequestException(
          `Invalid assignment: User must have ${assignmentType.toLowerCase().replace('_', ' ')} role`,
        );
      }
      const updateData =
        assignmentType === 'PROJECT_MANAGER'
          ? { projectManagerId: Number(userId) }
          : { engineerId: Number(userId) };
      const includeData =
        assignmentType === 'PROJECT_MANAGER'
          ? {
              projectManager: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            }
          : {
              engineer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            };
      const updatedProject = await this.prisma.project.update({
        where: { id: Number(projectId) },
        data: updateData,
        include: includeData,
      });

      return {
        message: `${assignmentType.toLowerCase().replace('_', ' ')} assigned successfully`,
        updatedProject,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else if (error instanceof PrismaClientValidationError) {
        throw new BadRequestException({ message: error.message });
      }
      throw new InternalServerErrorException(error);
    }
  }
  async getAssignedProject(userId: number, projectId: number) {
    this.logger.log('Get Assigned Project');
    if (!userId || !projectId) {
      throw new BadRequestException('Missing required params');
    }
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: Number(userId) },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const project = await this.prisma.project.findUnique({
        where: { id: Number(projectId) },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      if (
        project.engineerId !== user.id &&
        project.projectManagerId !== user.id
      ) {
        throw new ForbiddenException('Unauthorized attempt');
      }
      return project;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof ForbiddenException) {
        throw error;
      } else {
        this.logger.log(error);
        throw new InternalServerErrorException(
          'Unable to get assigned project',
        );
      }
    }
  }
  async deleteProject(projectId: number) {
    this.logger.log('Delete project');
    if (!projectId) {
      throw new BadRequestException('Missing required fields');
    }
  }
}
