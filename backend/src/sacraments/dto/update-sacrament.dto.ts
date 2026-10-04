import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMaxSize,
  IsNotEmpty,
} from 'class-validator';
import { SacramentTypeEnum, SponsorDto } from './create-sacrament.dto';

export enum SacramentStatusEnum {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export class UpdateSacramentDto {
  @ApiPropertyOptional({ enum: SacramentTypeEnum, description: 'Type of sacrament' })
  @IsOptional()
  @IsEnum(SacramentTypeEnum)
  type?: SacramentTypeEnum;

  @ApiPropertyOptional({ example: 'clx...memberId', description: 'Primary member receiving the sacrament' })
  @IsOptional()
  @IsString()
  primaryMemberId?: string;

  @ApiPropertyOptional({ example: 'clx...memberId', description: 'Secondary member (e.g. Bride/Groom for Marriage)' })
  @IsOptional()
  @IsString()
  secondaryMemberId?: string;

  @ApiPropertyOptional({ example: 'clx...familyId', description: 'Associated family ID' })
  @IsOptional()
  @IsString()
  familyId?: string;

  @ApiPropertyOptional({ example: '2026-10-05T08:00:00.000Z', description: 'Date sacrament was performed' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @ApiPropertyOptional({ example: 'clx...userId', description: 'Officiating priest user ID' })
  @IsOptional()
  @IsString()
  priestId?: string;

  @ApiPropertyOptional({ example: 'St. Gabriel Parish Church', description: 'Church where sacrament takes place' })
  @IsOptional()
  @IsString()
  church?: string;

  @ApiPropertyOptional({ enum: SacramentStatusEnum, example: SacramentStatusEnum.APPROVED })
  @IsOptional()
  @IsEnum(SacramentStatusEnum)
  status?: SacramentStatusEnum;

  @ApiPropertyOptional({ example: 'Updated with correct date', description: 'Updated remarks' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    type: [SponsorDto],
    description: 'Replaces the full list of sponsors (max 6)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => SponsorDto)
  sponsors?: SponsorDto[];
}
