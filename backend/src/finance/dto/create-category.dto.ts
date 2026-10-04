import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TransactionTypeEnum } from './create-transaction.dto';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Tithes & Offerings', description: 'Unique transaction category name' })
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;

  @ApiProperty({ enum: TransactionTypeEnum, example: TransactionTypeEnum.INCOME, description: 'Transaction category type' })
  @IsEnum(TransactionTypeEnum, { message: 'Type must be Income or Expense' })
  type: TransactionTypeEnum;
}
