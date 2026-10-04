import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum PaymentMethodEnum {
  CASH = 'Cash',
  BANK_TRANSFER = 'BankTransfer',
  MOBILE_MONEY = 'MobileMoney',
}

export enum RentPaymentStatusEnum {
  PAID = 'Paid',
  PENDING = 'Pending',
  OVERDUE = 'Overdue',
}

export class CreateRentPaymentDto {
  @ApiProperty({ example: 'clx...leaseAgreementId', description: 'Lease agreement ID' })
  @IsString()
  @IsNotEmpty({ message: 'Lease agreement ID is required' })
  leaseAgreementId: string;

  @ApiProperty({ example: 4500.0, description: 'Payment amount in ETB' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Amount must be greater than zero' })
  amount: number;

  @ApiPropertyOptional({ example: '2026-10-04T00:00:00.000Z', description: 'Payment date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  paymentDate?: Date = new Date();

  @ApiPropertyOptional({
    enum: PaymentMethodEnum,
    example: PaymentMethodEnum.CASH,
    description: 'Payment method used',
  })
  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  paymentMethod?: PaymentMethodEnum = PaymentMethodEnum.CASH;

  @ApiPropertyOptional({
    enum: RentPaymentStatusEnum,
    default: RentPaymentStatusEnum.PAID,
    description: 'Payment status',
  })
  @IsOptional()
  @IsEnum(RentPaymentStatusEnum)
  status?: RentPaymentStatusEnum = RentPaymentStatusEnum.PAID;
}
