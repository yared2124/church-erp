import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum MovementTypeEnum {
  IN = 'In',
  OUT = 'Out',
}

export class CreateStockMovementDto {
  @ApiProperty({ example: 'clx...itemId', description: 'Inventory item ID' })
  @IsString()
  @IsNotEmpty({ message: 'Item ID is required' })
  itemId: string;

  @ApiProperty({ example: 5, description: 'Quantity change (positive integer)' })
  @Type(() => Number)
  @IsInt({ message: 'Change quantity must be an integer' })
  @Min(1, { message: 'Change quantity must be at least 1' })
  changeQty: number;

  @ApiProperty({
    enum: MovementTypeEnum,
    example: MovementTypeEnum.IN,
    description: 'Stock movement type (In = received/donated, Out = distributed/consumed)',
  })
  @IsEnum(MovementTypeEnum, { message: 'Movement type must be In or Out' })
  movementType: MovementTypeEnum;

  @ApiPropertyOptional({
    example: 'Donation received from Sunday school group',
    description: 'Reason or note for stock movement',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
