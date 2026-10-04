import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export enum TransactionTypeEnum {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export enum TransactionStatusEnum {
  PAID = 'Paid',
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum PaymentMethodEnum {
  CASH = 'Cash',
  BANK_TRANSFER = 'BankTransfer',
  MOBILE_MONEY = 'MobileMoney',
}

export class CreateTransactionDto {
  @ApiProperty({ example: 'clx...accountId', description: 'Associated finance account ID' })
  @IsString()
  @IsNotEmpty({ message: 'Account ID is required' })
  accountId: string;

  @ApiProperty({ example: 'clx...categoryId', description: 'Transaction category ID' })
  @IsString()
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @ApiProperty({ enum: TransactionTypeEnum, example: TransactionTypeEnum.INCOME })
  @IsEnum(TransactionTypeEnum, { message: 'Type must be Income or Expense' })
  type: TransactionTypeEnum;

  @ApiProperty({ example: 'Weekly Sunday Tithe and Offering Collection', description: 'Transaction description / memo' })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({ example: 4500.0, description: 'Transaction monetary amount in ETB' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount: number;

  @ApiProperty({ enum: PaymentMethodEnum, example: PaymentMethodEnum.CASH })
  @IsEnum(PaymentMethodEnum, { message: 'Payment method must be Cash, BankTransfer, or MobileMoney' })
  paymentMethod: PaymentMethodEnum;

  @ApiPropertyOptional({
    enum: TransactionStatusEnum,
    default: TransactionStatusEnum.PENDING,
    description: 'Transaction approval status',
  })
  @IsOptional()
  @IsEnum(TransactionStatusEnum)
  status?: TransactionStatusEnum = TransactionStatusEnum.PENDING;

  @ApiPropertyOptional({ example: '2026-10-04T12:00:00.000Z', description: 'Transaction occurrence date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  transactionDate?: Date;
}
