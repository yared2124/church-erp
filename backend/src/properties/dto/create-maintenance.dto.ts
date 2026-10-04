import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum MaintenancePriorityEnum {
  LOW = 'Low',
  MEDIUM = 'Medium',
  URGENT = 'Urgent',
}

export enum MaintenanceStatusEnum {
  SCHEDULED = 'Scheduled',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
}

export class CreateMaintenanceDto {
  @ApiProperty({ example: 'clx...propertyId', description: 'Property requiring maintenance' })
  @IsString()
  @IsNotEmpty({ message: 'Property ID is required' })
  propertyId: string;

  @ApiProperty({ example: 'Water pipe leaking in kitchen', description: 'Description of the maintenance issue' })
  @IsString()
  @IsNotEmpty({ message: 'Issue description is required' })
  issue: string;

  @ApiPropertyOptional({
    enum: MaintenancePriorityEnum,
    default: MaintenancePriorityEnum.MEDIUM,
    description: 'Urgency level',
  })
  @IsOptional()
  @IsEnum(MaintenancePriorityEnum)
  priority?: MaintenancePriorityEnum = MaintenancePriorityEnum.MEDIUM;

  @ApiPropertyOptional({
    enum: MaintenanceStatusEnum,
    default: MaintenanceStatusEnum.SCHEDULED,
    description: 'Progress status',
  })
  @IsOptional()
  @IsEnum(MaintenanceStatusEnum)
  status?: MaintenanceStatusEnum = MaintenanceStatusEnum.SCHEDULED;
}

export class UpdateMaintenanceDto {
  @ApiPropertyOptional({ example: 'Plumber repaired broken valve', description: 'Updated issue/work description' })
  @IsOptional()
  @IsString()
  issue?: string;

  @ApiPropertyOptional({
    enum: MaintenancePriorityEnum,
    description: 'Updated priority',
  })
  @IsOptional()
  @IsEnum(MaintenancePriorityEnum)
  priority?: MaintenancePriorityEnum;

  @ApiPropertyOptional({
    enum: MaintenanceStatusEnum,
    description: 'Updated status',
  })
  @IsOptional()
  @IsEnum(MaintenanceStatusEnum)
  status?: MaintenanceStatusEnum;
}
