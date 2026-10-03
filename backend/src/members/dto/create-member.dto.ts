import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export enum GenderEnum {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum RoleInFamilyEnum {
  HEAD = 'Head',
  WIFE = 'Wife',
  HUSBAND = 'Husband',
  SON = 'Son',
  DAUGHTER = 'Daughter',
}

export enum MemberStatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  TRANSFERRED = 'Transferred',
  DECEASED = 'Deceased',
}

export class CreateMemberDto {
  @ApiProperty({ example: 'clx...familyId', description: 'ID of family this member belongs to' })
  @IsString()
  @IsNotEmpty({ message: 'Family ID is required' })
  familyId: string;

  @ApiProperty({ example: 'Kibreab', description: 'First name' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Haile', description: 'Father / Middle name' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: 'Gebremariam', description: 'Grandfather / Last name' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiProperty({ enum: GenderEnum, example: GenderEnum.MALE })
  @IsEnum(GenderEnum, { message: 'Gender must be Male or Female' })
  gender: GenderEnum;

  @ApiProperty({ example: '1990-05-15T00:00:00.000Z', description: 'Date of birth' })
  @Type(() => Date)
  @IsDate({ message: 'Valid date of birth is required' })
  dateOfBirth: Date;

  @ApiPropertyOptional({ example: '0911223344', description: '10-digit phone number' })
  @IsOptional()
  @IsString()
  @Matches(/^0\d{9}$/, { message: 'Phone must be a valid 10-digit number (e.g. 0911223344)' })
  phone?: string;

  @ApiPropertyOptional({ example: 'member@gmail.com', description: 'Email address' })
  @IsOptional()
  @IsEmail({}, { message: 'Valid email address required' })
  email?: string;

  @ApiPropertyOptional({ example: 'Bole Subcity, Woreda 03', description: 'Residential address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ enum: RoleInFamilyEnum, example: RoleInFamilyEnum.HEAD })
  @IsEnum(RoleInFamilyEnum, { message: 'Role in family must be Head, Wife, Husband, Son, or Daughter' })
  roleInFamily: RoleInFamilyEnum;

  @ApiPropertyOptional({ enum: MemberStatusEnum, default: MemberStatusEnum.ACTIVE })
  @IsOptional()
  @IsEnum(MemberStatusEnum)
  status?: MemberStatusEnum = MemberStatusEnum.ACTIVE;

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
