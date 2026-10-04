import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PropertyStatusEnum, PropertyTypeEnum } from './create-property.dto';

export class UpdatePropertyDto {
  @ApiPropertyOptional({ example: 'Unit A-102 (Renovated)', description: 'Updated unit name' })
  @IsOptional()
  @IsString()
  unitName?: string;

  @ApiPropertyOptional({
    enum: PropertyTypeEnum,
    example: PropertyTypeEnum.SHOP,
    description: 'Updated property category',
  })
  @IsOptional()
  @IsEnum(PropertyTypeEnum)
  type?: PropertyTypeEnum;

  @ApiPropertyOptional({ example: 5000.0, description: 'Updated monthly rent rate in ETB' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyRent?: number;

  @ApiPropertyOptional({
    enum: PropertyStatusEnum,
    example: PropertyStatusEnum.OCCUPIED,
    description: 'Updated occupancy status',
  })
  @IsOptional()
  @IsEnum(PropertyStatusEnum)
  status?: PropertyStatusEnum;
}
