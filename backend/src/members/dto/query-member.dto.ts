import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { MemberStatusEnum, RoleInFamilyEnum } from './create-member.dto';

export enum SebekaStatusEnum {
  PAID = 'Paid',
  PARTIAL = 'Partial',
  UNPAID = 'Unpaid',
  OVERDUE = 'Overdue',
}

export class QueryMemberDto {
  @ApiPropertyOptional({ description: 'Search term across name, email, or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MemberStatusEnum, description: 'Filter by member status' })
  @IsOptional()
  @IsEnum(MemberStatusEnum)
  status?: MemberStatusEnum;

  @ApiPropertyOptional({ enum: RoleInFamilyEnum, description: 'Filter by role in family' })
  @IsOptional()
  @IsEnum(RoleInFamilyEnum)
  roleInFamily?: RoleInFamilyEnum;

  @ApiPropertyOptional({ description: 'Filter by family CUID' })
  @IsOptional()
  @IsString()
  familyId?: string;

  @ApiPropertyOptional({ description: 'Filter by confessor priest user ID' })
  @IsOptional()
  @IsString()
  confessorPriestId?: string;

  @ApiPropertyOptional({ enum: SebekaStatusEnum, description: 'Filter by family Sebeka contribution status' })
  @IsOptional()
  @IsEnum(SebekaStatusEnum)
  sebekaStatus?: SebekaStatusEnum;

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
