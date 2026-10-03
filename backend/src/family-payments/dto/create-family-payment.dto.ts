import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum PaymentMethodEnum {
  CASH = 'Cash',
  BANK_TRANSFER = 'BankTransfer',
  MOBILE_MONEY = 'MobileMoney',
}

export class CreateFamilyPaymentDto {
  @ApiProperty({ example: 'clx...familyId', description: 'ID of family this contribution belongs to' })
  @IsString()
  @IsNotEmpty({ message: 'Family ID is required' })
  familyId: string;

  @ApiProperty({ example: 2026, description: 'Sebeka contribution fiscal/calendar year' })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({ example: 1200.0, description: 'Expected annual assessment amount' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'Expected amount must be positive' })
  expectedAmount: number;

  @ApiProperty({ example: 1200.0, description: 'Actual paid contribution amount' })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Paid amount cannot be negative' })
  paidAmount: number;

  @ApiPropertyOptional({ example: '2026-03-15T00:00:00.000Z', description: 'Date contribution collected' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  paymentDate?: Date;

  @ApiProperty({ enum: PaymentMethodEnum, default: PaymentMethodEnum.CASH })
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum = PaymentMethodEnum.CASH;

  @ApiProperty({ example: 'REC-2026-0891', description: 'Physical receipt voucher number' })
  @IsString()
  @IsNotEmpty({ message: 'Receipt voucher number is required' })
  receiptNumber: string;

  @ApiPropertyOptional({ example: 'https://storage.../receipts/rec.jpg', description: 'Scanned receipt URL' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiPropertyOptional({ example: 'Paid in full for 2026 calendar year', description: 'Optional cashier remarks' })
  @IsOptional()
  @IsString()
  notes?: string;
}
