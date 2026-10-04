import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum CertificateTypeEnum {
  BAPTISM = 'Baptism',
  MARRIAGE = 'Marriage',
  BURIAL = 'Burial',
}

export class CreateCertificateRequestDto {
  @ApiProperty({ example: 'clx...memberId', description: 'Member requesting the certificate' })
  @IsString()
  @IsNotEmpty({ message: 'Member ID is required' })
  memberId: string;

  @ApiProperty({
    enum: CertificateTypeEnum,
    example: CertificateTypeEnum.BAPTISM,
    description: 'Type of certificate being requested',
  })
  @IsEnum(CertificateTypeEnum, { message: 'Certificate type must be Baptism, Marriage, or Burial' })
  type: CertificateTypeEnum;

  @ApiPropertyOptional({
    example: 'Required for school enrollment',
    description: 'Reason or purpose for requesting the certificate',
  })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({ example: 'Urgently needed by next week', description: 'Optional requester notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
