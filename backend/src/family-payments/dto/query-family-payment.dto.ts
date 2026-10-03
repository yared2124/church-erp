import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaymentMethodEnum } from './create-family-payment.dto';
import { SebekaStatusEnum } from '../../members/dto/query-member.dto';

export class QueryFamilyPaymentDto {
  @ApiPropertyOptional({ description: 'Search receipt number or family name/phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by contribution year' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ enum: SebekaStatusEnum, description: 'Filter by contribution status' })
  @IsOptional()
  @IsEnum(SebekaStatusEnum)
  status?: SebekaStatusEnum;

  @ApiPropertyOptional({ enum: PaymentMethodEnum, description: 'Filter by payment method' })
  @IsOptional()
  @IsEnum(PaymentMethodEnum)
  paymentMethod?: PaymentMethodEnum;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
