import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum PropertyTypeEnum {
  HOUSE = 'House',
  SHOP = 'Shop',
  OFFICE = 'Office',
  STORAGE = 'Storage',
}

export enum PropertyStatusEnum {
  OCCUPIED = 'Occupied',
  VACANT = 'Vacant',
}

export class CreatePropertyDto {
  @ApiProperty({ example: 'Unit A-102', description: 'Unique unit identifier or name' })
  @IsString()
  @IsNotEmpty({ message: 'Unit name is required' })
  unitName: string;

  @ApiProperty({
    enum: PropertyTypeEnum,
    example: PropertyTypeEnum.HOUSE,
    description: 'Property category: House, Shop, Office, or Storage',
  })
  @IsEnum(PropertyTypeEnum, { message: 'Type must be House, Shop, Office, or Storage' })
  type: PropertyTypeEnum;

  @ApiProperty({ example: 4500.0, description: 'Monthly rent rate in ETB' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Monthly rent must be a valid currency amount' })
  @Min(0, { message: 'Monthly rent cannot be negative' })
  monthlyRent: number;

  @ApiPropertyOptional({
    enum: PropertyStatusEnum,
    default: PropertyStatusEnum.VACANT,
    description: 'Current occupancy status',
  })
  @IsOptional()
  @IsEnum(PropertyStatusEnum)
  status?: PropertyStatusEnum = PropertyStatusEnum.VACANT;
}
