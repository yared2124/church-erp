import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { HistoryEntryTypeEnum } from './create-history-entry.dto';

export class UpdateHistoryEntryDto {
  @ApiPropertyOptional({ example: 1968, description: 'Year' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1800)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ example: 'Foundation of Birhane Genet St. Mary Church', description: 'Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated details on the consecration ceremony', description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: HistoryEntryTypeEnum, description: 'Type' })
  @IsOptional()
  @IsEnum(HistoryEntryTypeEnum)
  type?: HistoryEntryTypeEnum;
}
