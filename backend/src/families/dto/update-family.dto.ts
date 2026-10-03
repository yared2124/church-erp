import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { FamilyStatusEnum } from './create-family.dto';

export class UpdateFamilyDto {
  @ApiPropertyOptional({ example: 'Ato Abebe & Woizero Almaz Family', description: 'Household/Family unit name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Bole Subcity, House #124', description: 'Residential address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '0911223344', description: 'Primary family contact phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z', description: 'Registration date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationDate?: Date;

  @ApiPropertyOptional({ enum: FamilyStatusEnum })
  @IsOptional()
  @IsEnum(FamilyStatusEnum)
  status?: FamilyStatusEnum;
}
