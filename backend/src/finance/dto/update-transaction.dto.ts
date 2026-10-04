import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import {
  PaymentMethodEnum,
  TransactionStatusEnum,
  TransactionTypeEnum,
} from './create-transaction.dto';

export class UpdateTransactionDto {
  @ApiPropertyOptional({ example: 'clx...accountId', description: 'Associated finance account ID' })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({ example: 'clx...categoryId', description: 'Transaction category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: TransactionTypeEnum, example: TransactionTypeEnum.INCOME })
  @IsOptional()
  @IsEnum(TransactionTypeEnum)
  type?: TransactionTypeEnum;

  @ApiPropertyOptional({ example: 'Updated Sunday Tithe and Offering Collection' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 5000.0, description: 'Updated monetary amount in ETB' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount?: number;

  @ApiPropertyOptional({ enum: PaymentMethodEnum, example: PaymentMethodEnum.BANK_TRANSFER })
  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  paymentMethod?: PaymentMethodEnum;

  @ApiPropertyOptional({ enum: TransactionStatusEnum, example: TransactionStatusEnum.APPROVED })
  @IsOptional()
  @IsEnum(TransactionStatusEnum)
  status?: TransactionStatusEnum;

  @ApiPropertyOptional({ example: '2026-10-04T12:00:00.000Z', description: 'Transaction occurrence date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  transactionDate?: Date;
}
