import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum AuditStatusEnum {
  SUCCESS = 'Success',
  FAILED = 'Failed',
}

export class QueryAuditLogDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by action (e.g. CREATE, UPDATE, DELETE, LOGIN)' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Filter by entity type (e.g. Member, Sacrament, Property)' })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiPropertyOptional({ enum: AuditStatusEnum, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(AuditStatusEnum)
  status?: AuditStatusEnum;

  @ApiPropertyOptional({ description: 'Search description, IP address, or entity ID' })
  @IsOptional()
  @IsString()
  search?: string;
}
