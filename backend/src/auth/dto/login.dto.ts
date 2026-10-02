import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'abba.yohannes@stmarychurch.et',
    description: 'Email address of the church official or staff member',
  })
  @IsEmail({}, { message: 'Please provide a valid church email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'ChangeMe123!',
    description: 'Account password for authentication',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(1, { message: 'Password must not be empty' })
  password: string;
}
