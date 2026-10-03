import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { GenderEnum, MemberStatusEnum, RoleInFamilyEnum } from './create-member.dto';

export class UpdateMemberDto {
  @ApiPropertyOptional({ description: 'ID of family this member belongs to' })
  @IsOptional()
  @IsString()
  familyId?: string;

  @ApiPropertyOptional({ example: 'Kibreab', description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Haile', description: 'Father / Middle name' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiPropertyOptional({ example: 'Gebremariam', description: 'Grandfather / Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: GenderEnum })
  @IsOptional()
  @IsEnum(GenderEnum)
  gender?: GenderEnum;

  @ApiPropertyOptional({ example: '1990-05-15T00:00:00.000Z', description: 'Date of birth' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: '0911223344', description: '10-digit phone number' })
  @IsOptional()
  @IsString()
  @Matches(/^0\d{9}$/, { message: 'Phone must be a valid 10-digit number (e.g. 0911223344)' })
  phone?: string;

  @ApiPropertyOptional({ example: 'member@gmail.com', description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Bole Subcity, Woreda 03', description: 'Residential address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: RoleInFamilyEnum })
  @IsOptional()
  @IsEnum(RoleInFamilyEnum)
  roleInFamily?: RoleInFamilyEnum;

  @ApiPropertyOptional({ enum: MemberStatusEnum })
  @IsOptional()
  @IsEnum(MemberStatusEnum)
  status?: MemberStatusEnum;

  @ApiPropertyOptional({ example: 'clx...priestId', description: 'Spiritual confessor priest ID' })
  @IsOptional()
  @IsString()
  confessorPriestId?: string;

  @ApiPropertyOptional({ example: '1990-06-25T00:00:00.000Z', description: 'Baptism date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  baptizedDate?: Date;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z', description: 'Membership registration date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  membershipDate?: Date;
}
