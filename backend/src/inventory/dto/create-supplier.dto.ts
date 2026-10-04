import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'St. George Church Supplies PLC', description: 'Supplier name' })
  @IsString()
  @IsNotEmpty({ message: 'Supplier name is required' })
  name: string;

  @ApiPropertyOptional({ example: '+251911002233', description: 'Supplier phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'orders@stgeorgesupplies.et', description: 'Supplier email' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
