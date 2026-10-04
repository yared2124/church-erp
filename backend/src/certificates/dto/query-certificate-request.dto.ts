import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CertificateTypeEnum } from './create-certificate-request.dto';
import { CertificateStatusEnum } from './update-certificate-request.dto';

export class QueryCertificateRequestDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: CertificateTypeEnum, description: 'Filter by certificate type' })
  @IsOptional()
  @IsEnum(CertificateTypeEnum)
  type?: CertificateTypeEnum;

  @ApiPropertyOptional({ enum: CertificateStatusEnum, description: 'Filter by approval status' })
  @IsOptional()
  @IsEnum(CertificateStatusEnum)
  status?: CertificateStatusEnum;

  @ApiPropertyOptional({ description: 'Filter by member ID' })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional({ description: 'Search member name or purpose' })
  @IsOptional()
  @IsString()
  search?: string;
}
