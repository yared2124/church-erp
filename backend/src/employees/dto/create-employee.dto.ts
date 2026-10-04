import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum EmploymentTypeEnum {
  FULL_TIME = 'FullTime',
  PART_TIME = 'PartTime',
  CONTRACT = 'Contract',
  VOLUNTEER = 'Volunteer',
}

export enum EmployeeStatusEnum {
  ACTIVE = 'Active',
  ON_LEAVE = 'OnLeave',
  DEPARTED = 'Departed',
}

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Kesis Tewodros Haile', description: 'Employee full legal name' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @ApiProperty({ example: 'Clergy & Pastoral Care', description: 'Department or church section' })
  @IsString()
  @IsNotEmpty({ message: 'Department is required' })
  department: string;

  @ApiProperty({ example: 'Senior Priest / Confessor', description: 'Job position / title' })
  @IsString()
  @IsNotEmpty({ message: 'Position is required' })
  position: string;

  @ApiPropertyOptional({ example: '+251911334455', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'tewodros@stmarychurch.et', description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    enum: EmploymentTypeEnum,
    default: EmploymentTypeEnum.FULL_TIME,
    description: 'Type of employment',
  })
  @IsOptional()
  @IsEnum(EmploymentTypeEnum)
  employmentType?: EmploymentTypeEnum = EmploymentTypeEnum.FULL_TIME;

  @ApiPropertyOptional({
    enum: EmployeeStatusEnum,
    default: EmployeeStatusEnum.ACTIVE,
    description: 'Current employee status',
  })
  @IsOptional()
  @IsEnum(EmployeeStatusEnum)
  status?: EmployeeStatusEnum = EmployeeStatusEnum.ACTIVE;

  @ApiPropertyOptional({ example: '2024-09-11T00:00:00.000Z', description: 'Date joined church service' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  joinDate?: Date = new Date();

  @ApiPropertyOptional({ example: 'clx...userId', description: 'Linked system user ID' })
  @IsOptional()
  @IsString()
  userId?: string;
}
