import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserStatusEnum } from './create-user.dto';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Deacon Solomon', description: 'Updated display name' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;

  @ApiPropertyOptional({ example: 'solomon@stmarychurch.et', description: 'Updated email address' })
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @ApiPropertyOptional({ example: 'NewSecret123', description: 'Updated password (minimum 6 characters)' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @ApiPropertyOptional({ example: '+251911223344', description: 'Updated phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Cashier', description: 'Updated role' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ enum: UserStatusEnum, description: 'Updated status' })
  @IsOptional()
  @IsEnum(UserStatusEnum, { message: 'Status must be Active, Inactive, or Locked' })
  status?: UserStatusEnum;
}
