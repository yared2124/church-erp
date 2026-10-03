import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FamilyStatusEnum } from './create-family.dto';
import { SebekaStatusEnum } from '../../members/dto/query-member.dto';

export class QueryFamilyDto {
  @ApiPropertyOptional({ description: 'Search term across family name or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: FamilyStatusEnum, description: 'Filter by family status' })
  @IsOptional()
  @IsEnum(FamilyStatusEnum)
  status?: FamilyStatusEnum;

  @ApiPropertyOptional({ enum: SebekaStatusEnum, description: 'Filter by Sebeka dues payment status' })
  @IsOptional()
  @IsEnum(SebekaStatusEnum)
  sebekaStatus?: SebekaStatusEnum;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
