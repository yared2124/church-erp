import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({
    example: { churchName: 'Birhane Genet St. Mary Church', phone: '+251 11 123 4567' },
    description: 'Arbitrary JSON payload storing configuration settings',
  })
  @IsNotEmpty({ message: 'Setting value is required' })
  value: Record<string, unknown>;
}
