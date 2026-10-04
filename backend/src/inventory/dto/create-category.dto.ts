import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Sacred Vessels', description: 'Inventory category name' })
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;
}
