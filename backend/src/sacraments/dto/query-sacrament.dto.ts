import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SacramentTypeEnum } from './create-sacrament.dto';
import { SacramentStatusEnum } from './update-sacrament.dto';

export class QuerySacramentDto {
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

  @ApiPropertyOptional({ enum: SacramentTypeEnum, description: 'Filter by sacrament type' })
  @IsOptional()
  @IsEnum(SacramentTypeEnum)
  type?: SacramentTypeEnum;

  @ApiPropertyOptional({ enum: SacramentStatusEnum, description: 'Filter by approval status' })
  @IsOptional()
  @IsEnum(SacramentStatusEnum)
  status?: SacramentStatusEnum;

  @ApiPropertyOptional({ description: 'Filter by primary or secondary member ID' })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional({ description: 'Filter by officiating priest user ID' })
  @IsOptional()
  @IsString()
  priestId?: string;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z', description: 'Filter from date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.999Z', description: 'Filter to date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Full-text search member name or church' })
  @IsOptional()
  @IsString()
  search?: string;
}
