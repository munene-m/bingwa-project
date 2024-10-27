import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  NotFoundException,
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

  async assignProject(projectId: number, projectManagerId: number) {
    this.logger.log('Assign project');
    try {
      const projectManager = await this.prisma.user.findUnique({
        where: { id: Number(projectManagerId) },
      });

      if (!projectManager || projectManager.role !== Role.PROJECT_MANAGER) {
        throw new BadRequestException('Invalid project manager assignment');
      }
      const updatedProject = await this.prisma.project.update({
        where: { id: Number(projectId) },
        data: { projectManagerId: Number(projectManagerId) },
        include: {
          projectManager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return {
        message: 'Project manager assigned successfully',
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
}
