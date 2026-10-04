import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';

export enum SacramentTypeEnum {
  BAPTISM = 'Baptism',
  MARRIAGE = 'Marriage',
  BURIAL = 'Burial',
}

export class SponsorDto {
  @ApiProperty({ example: 'Yonas Tesfaye', description: 'Sponsor full name' })
  @IsString()
  @IsNotEmpty({ message: 'Sponsor name is required' })
  name: string;

  @ApiProperty({ example: 'Godfather', description: 'Sponsor relation to candidate (e.g. Godfather, Witness)' })
  @IsString()
  @IsNotEmpty({ message: 'Sponsor relation is required' })
  relation: string;
}

export class CreateSacramentDto {
  @ApiProperty({ enum: SacramentTypeEnum, example: SacramentTypeEnum.BAPTISM, description: 'Type of sacrament' })
  @IsEnum(SacramentTypeEnum, { message: 'Type must be Baptism, Marriage, or Burial' })
  type: SacramentTypeEnum;

  @ApiProperty({ example: 'clx...memberId', description: 'Primary member receiving the sacrament' })
  @IsString()
  @IsNotEmpty({ message: 'Primary member ID is required' })
  primaryMemberId: string;

  @ApiPropertyOptional({ example: 'clx...memberId', description: 'Secondary member (e.g. Bride/Groom for Marriage)' })
  @IsOptional()
  @IsString()
  secondaryMemberId?: string;

  @ApiPropertyOptional({ example: 'clx...familyId', description: 'Associated family ID' })
  @IsOptional()
  @IsString()
  familyId?: string;

  @ApiProperty({ example: '2026-10-05T08:00:00.000Z', description: 'Date sacrament was/will be performed' })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiPropertyOptional({ example: 'clx...userId', description: 'Officiating priest user ID' })
  @IsOptional()
  @IsString()
  priestId?: string;

  @ApiPropertyOptional({ example: 'St. Mary Birhane Genet Church', description: 'Church where sacrament takes place' })
  @IsOptional()
  @IsString()
  church?: string;

  @ApiPropertyOptional({ example: 'Blessed during Holy Timkat season', description: 'Optional remarks' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    type: [SponsorDto],
    description: 'List of sponsors or witnesses (max 6)',
    example: [{ name: 'Yonas Tesfaye', relation: 'Godfather' }],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6, { message: 'A maximum of 6 sponsors is allowed' })
  @ValidateNested({ each: true })
  @Type(() => SponsorDto)
  sponsors?: SponsorDto[];
}
