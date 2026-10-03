import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export enum UserStatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  LOCKED = 'Locked',
}

export class CreateUserDto {
  @ApiProperty({ example: 'Deacon Solomon', description: 'Full display name of user' })
  @IsString()
  @IsNotEmpty({ message: 'Name must not be empty' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @ApiProperty({ example: 'solomon@stmarychurch.et', description: 'Unique user email' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @ApiProperty({ example: 'SecureP@ss123', description: 'Account password (minimum 6 characters)' })
  @IsString()
  @IsNotEmpty({ message: 'Password must not be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiPropertyOptional({ example: '+251911223344', description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Priest', description: 'Assigned system role name' })
  @IsString()
  @IsNotEmpty({ message: 'Role must be selected' })
  role: string;

  @ApiPropertyOptional({ enum: UserStatusEnum, default: UserStatusEnum.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatusEnum, { message: 'Status must be Active, Inactive, or Locked' })
  status?: UserStatusEnum = UserStatusEnum.ACTIVE;
}
