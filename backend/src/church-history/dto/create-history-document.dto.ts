import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateHistoryDocumentDto {
  @ApiProperty({ example: '1968 Parish Consecration Certificate', description: 'Document title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    example: 'https://storage.stmarychurch.et/documents/consecration-1968.pdf',
    description: 'Public or secure URL to the archived document / scan',
  })
  @IsString()
  @IsNotEmpty({ message: 'File URL is required' })
  fileUrl: string;
}
