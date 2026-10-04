import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'Main Church Operating Account', description: 'Financial treasury or bank account name' })
  @IsString()
  @IsNotEmpty({ message: 'Account name is required' })
  name: string;

  @ApiPropertyOptional({ example: 100000.0, default: 0, description: 'Initial opening balance in ETB' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Opening balance cannot be negative' })
  openingBalance?: number = 0;
}
