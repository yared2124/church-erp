import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { EmployeeStatusEnum, EmploymentTypeEnum } from './create-employee.dto';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({ example: 'Kesis Tewodros Haile', description: 'Employee full legal name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'Clergy & Pastoral Care', description: 'Department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 'Chief Priest', description: 'Position' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: '+251911334455', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'tewodros.h@stmarychurch.et', description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: EmploymentTypeEnum, description: 'Type of employment' })
  @IsOptional()
  @IsEnum(EmploymentTypeEnum)
  employmentType?: EmploymentTypeEnum;

  @ApiPropertyOptional({ enum: EmployeeStatusEnum, description: 'Current employee status' })
  @IsOptional()
  @IsEnum(EmployeeStatusEnum)
  status?: EmployeeStatusEnum;

  @ApiPropertyOptional({ example: '2024-09-11T00:00:00.000Z', description: 'Date joined' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  joinDate?: Date;

  @ApiPropertyOptional({ example: 'clx...userId', description: 'Linked system user ID' })
  @IsOptional()
  @IsString()
  userId?: string;
}
