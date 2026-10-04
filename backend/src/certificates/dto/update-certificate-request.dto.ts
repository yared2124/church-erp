import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CertificateTypeEnum } from './create-certificate-request.dto';

export enum CertificateStatusEnum {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  ISSUED = 'Issued',
}

export class UpdateCertificateRequestDto {
  @ApiPropertyOptional({
    enum: CertificateStatusEnum,
    example: CertificateStatusEnum.APPROVED,
    description: 'Updated approval/issuance status',
  })
  @IsOptional()
  @IsEnum(CertificateStatusEnum)
  status?: CertificateStatusEnum;

  @ApiPropertyOptional({ example: 'Verified against baptism registry — approved', description: 'Reviewer or issuer notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'Required for immigration application', description: 'Updated purpose' })
  @IsOptional()
  @IsString()
  purpose?: string;
}
