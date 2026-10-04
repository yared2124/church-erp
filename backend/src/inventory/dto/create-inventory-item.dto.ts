import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum StockStatusEnum {
  IN_STOCK = 'InStock',
  LOW_STOCK = 'LowStock',
  OUT_OF_STOCK = 'OutOfStock',
}

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'Holy Communion Chalice', description: 'Item name' })
  @IsString()
  @IsNotEmpty({ message: 'Item name is required' })
  name: string;

  @ApiProperty({ example: 'clx...categoryId', description: 'Inventory category ID' })
  @IsString()
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @ApiPropertyOptional({ default: 0, example: 10, description: 'Initial stock quantity' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Quantity cannot be negative' })
  quantity?: number = 0;

  @ApiProperty({ example: 350.0, description: 'Unit cost/valuation in ETB' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Unit price cannot be negative' })
  unitPrice: number;

  @ApiPropertyOptional({ example: 'Altar Storage Shelf B', description: 'Storage location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    enum: StockStatusEnum,
    default: StockStatusEnum.IN_STOCK,
    description: 'Stock status',
  })
  @IsOptional()
  @IsEnum(StockStatusEnum)
  status?: StockStatusEnum = StockStatusEnum.IN_STOCK;
}
