import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateLeaseDto {
  @ApiProperty({ example: 'clx...propertyId', description: 'Property ID to lease' })
  @IsString()
  @IsNotEmpty({ message: 'Property ID is required' })
  propertyId: string;

  @ApiPropertyOptional({ example: 'clx...tenantId', description: 'Existing tenant ID if already registered' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({ example: 'Abebe Bikila', description: 'Tenant full name (if registering new tenant)' })
  @IsOptional()
  @IsString()
  tenantName?: string;

  @ApiPropertyOptional({ example: '+251911223344', description: 'Tenant phone number' })
  @IsOptional()
  @IsString()
  tenantPhone?: string;

  @ApiPropertyOptional({ example: 'abebe@example.com', description: 'Tenant email address' })
  @IsOptional()
  @IsEmail()
  tenantEmail?: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Lease start date' })
  @Type(() => Date)
  @IsDate({ message: 'Start date must be a valid date' })
  startDate: Date;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z', description: 'Lease end date' })
  @Type(() => Date)
  @IsDate({ message: 'End date must be a valid date' })
  endDate: Date;

  @ApiPropertyOptional({ example: 4500.0, description: 'Agreed monthly rent rate (overrides property default)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyRent?: number;
}
