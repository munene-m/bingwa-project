import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateProjectDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  startDate: Date;

  @IsString()
  endDate: Date;

  @IsEnum(Status)
  status: Status;
}
