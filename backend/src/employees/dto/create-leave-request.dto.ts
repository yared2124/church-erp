import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum LeaveStatusEnum {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  REJECTED = 'Rejected',
}

export class CreateLeaveRequestDto {
  @ApiProperty({ example: 'clx...employeeId', description: 'Employee requesting leave' })
  @IsString()
  @IsNotEmpty({ message: 'Employee ID is required' })
  employeeId: string;

  @ApiProperty({ example: '2026-11-01T00:00:00.000Z', description: 'Leave start date' })
  @Type(() => Date)
  @IsDate({ message: 'Start date must be a valid date' })
  startDate: Date;

  @ApiProperty({ example: '2026-11-15T23:59:59.000Z', description: 'Leave end date' })
  @Type(() => Date)
  @IsDate({ message: 'End date must be a valid date' })
  endDate: Date;

  @ApiPropertyOptional({ example: 'Annual spiritual retreat / pilgrimage', description: 'Reason for leave' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    enum: LeaveStatusEnum,
    default: LeaveStatusEnum.PENDING,
    description: 'Initial leave request status',
  })
  @IsOptional()
  @IsEnum(LeaveStatusEnum)
  status?: LeaveStatusEnum = LeaveStatusEnum.PENDING;
}

export class UpdateLeaveStatusDto {
  @ApiProperty({
    enum: LeaveStatusEnum,
    example: LeaveStatusEnum.APPROVED,
    description: 'Updated leave approval status',
  })
  @IsEnum(LeaveStatusEnum, { message: 'Status must be Approved, Pending, or Rejected' })
  status: LeaveStatusEnum;

  @ApiPropertyOptional({ example: 'Approved by Parish Administration', description: 'Reviewer comments' })
  @IsOptional()
  @IsString()
  reason?: string;
}
