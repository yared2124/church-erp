import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StockStatusEnum } from './create-inventory-item.dto';

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ example: 'Holy Communion Chalice (Gold-plated)', description: 'Item name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'clx...categoryId', description: 'Inventory category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 12, description: 'Stock quantity' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: 400.0, description: 'Unit cost/valuation in ETB' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice?: number;

  @ApiPropertyOptional({ example: 'Main Sacristy Safe 1', description: 'Storage location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: StockStatusEnum, description: 'Stock status' })
  @IsOptional()
  @IsEnum(StockStatusEnum)
  status?: StockStatusEnum;
}
