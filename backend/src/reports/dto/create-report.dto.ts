import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum ReportFormatEnum {
  PDF = 'PDF',
  EXCEL = 'Excel',
}

export class CreateReportDto {
  @ApiProperty({ example: 'Q3 Financial Audit & Income Report', description: 'Report name' })
  @IsString()
  @IsNotEmpty({ message: 'Report name is required' })
  name: string;

  @ApiProperty({ example: 'Finance', description: 'Report category (e.g. Finance, Members, Inventory, Sacraments)' })
  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @ApiProperty({ enum: ReportFormatEnum, example: ReportFormatEnum.PDF, description: 'Export format: PDF or Excel' })
  @IsEnum(ReportFormatEnum, { message: 'Format must be PDF or Excel' })
  format: ReportFormatEnum;
}
