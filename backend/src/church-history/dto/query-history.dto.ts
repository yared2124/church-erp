import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { HistoryEntryTypeEnum } from './create-history-entry.dto';

export class QueryHistoryDto {
  @ApiPropertyOptional({ enum: HistoryEntryTypeEnum, description: 'Filter by event type' })
  @IsOptional()
  @IsEnum(HistoryEntryTypeEnum)
  type?: HistoryEntryTypeEnum;

  @ApiPropertyOptional({ example: 1960, description: 'Start year' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  startYear?: number;

  @ApiPropertyOptional({ example: 2000, description: 'End year' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  endYear?: number;

  @ApiPropertyOptional({ description: 'Search title or description' })
  @IsOptional()
  @IsString()
  search?: string;
}
