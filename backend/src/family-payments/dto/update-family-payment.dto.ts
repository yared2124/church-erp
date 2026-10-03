import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethodEnum } from './create-family-payment.dto';

export class UpdateFamilyPaymentDto {
  @ApiPropertyOptional({ example: 1200.0, description: 'Updated expected amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'Expected amount must be positive' })
  expectedAmount?: number;

  @ApiPropertyOptional({ example: 1200.0, description: 'Updated paid contribution amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Paid amount cannot be negative' })
  paidAmount?: number;

  @ApiPropertyOptional({ example: '2026-03-15T00:00:00.000Z', description: 'Updated collection date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  paymentDate?: Date;

  @ApiPropertyOptional({ enum: PaymentMethodEnum })
  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  paymentMethod?: PaymentMethodEnum;

  @ApiPropertyOptional({ example: 'REC-2026-0891-B', description: 'Updated receipt voucher number' })
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @ApiPropertyOptional({ example: 'https://storage.../receipts/rec.jpg', description: 'Updated receipt URL' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiPropertyOptional({ example: 'Partial installment reconciled', description: 'Updated remarks' })
  @IsOptional()
  @IsString()
  notes?: string;
}
