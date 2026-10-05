import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum ImportTypeEnum {
  MEMBERS = 'Members',
  ACCOUNTS = 'Accounts',
  TRANSACTIONS = 'Transactions',
  DONATIONS = 'Donations',
  ASSETS = 'Assets',
}

export enum ImportStatusEnum {
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  PROCESSING = 'Processing',
}

export class CreateImportJobDto {
  @ApiProperty({
    enum: ImportTypeEnum,
    example: ImportTypeEnum.MEMBERS,
    description: 'Entity type being bulk-imported',
  })
  @IsEnum(ImportTypeEnum, { message: 'Type must be Members, Accounts, Transactions, Donations, or Assets' })
  type: ImportTypeEnum;

  @ApiProperty({ example: 150, description: 'Total row count in imported batch' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalRecords: number;

  @ApiPropertyOptional({ default: 0, example: 148, description: 'Successfully imported count' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  successCount?: number = 0;

  @ApiPropertyOptional({ default: 0, example: 2, description: 'Failed row count' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  failCount?: number = 0;

  @ApiPropertyOptional({
    enum: ImportStatusEnum,
    default: ImportStatusEnum.COMPLETED,
    description: 'Import status',
  })
  @IsOptional()
  @IsEnum(ImportStatusEnum)
  status?: ImportStatusEnum = ImportStatusEnum.COMPLETED;
}
