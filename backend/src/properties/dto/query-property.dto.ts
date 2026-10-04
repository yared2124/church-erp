import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PropertyStatusEnum, PropertyTypeEnum } from './create-property.dto';

export class QueryPropertyDto {
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

  @ApiPropertyOptional({ enum: PropertyTypeEnum, description: 'Filter by property type' })
  @IsOptional()
  @IsEnum(PropertyTypeEnum)
  type?: PropertyTypeEnum;

  @ApiPropertyOptional({ enum: PropertyStatusEnum, description: 'Filter by occupancy status' })
  @IsOptional()
  @IsEnum(PropertyStatusEnum)
  status?: PropertyStatusEnum;

  @ApiPropertyOptional({ description: 'Search by unit name' })
  @IsOptional()
  @IsString()
  search?: string;
}
