import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Dn. Michael Tadesse',
    description: 'Full baptismal or civil name of the church official',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  name: string;

  @ApiProperty({
    example: 'dn.michael@stmarychurch.et',
    description: 'Unique email address for portal authentication',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'SecureChurchPassword2026!',
    description: 'Password with minimum 6 characters',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiPropertyOptional({
    example: '+251911223344',
    description: 'Direct contact phone number for verification',
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
