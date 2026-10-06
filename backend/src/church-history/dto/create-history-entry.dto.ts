import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export enum HistoryEntryTypeEnum {
  MILESTONE = 'Milestone',
  EVENT = 'Event',
}

export class CreateHistoryEntryDto {
  @ApiProperty({ example: 1968, description: 'Year the milestone or historical event occurred' })
  @Type(() => Number)
  @IsInt({ message: 'Year must be a valid whole number' })
  @Min(1800, { message: 'Year must be 1800 or later' })
  @Max(2100, { message: 'Year cannot be in the distant future' })
  year: number;

  @ApiProperty({ example: 'Foundation of Chagni Birhane Genet Kidist Ba'ata Lemariyam', description: 'Title of the event' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    example: 'The initial church tabot was consecrated and parish established by His Holiness Abuna Basilios.',
    description: 'Detailed description of the historical event',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({
    enum: HistoryEntryTypeEnum,
    example: HistoryEntryTypeEnum.MILESTONE,
    description: 'Event categorization: Milestone or Event',
  })
  @IsEnum(HistoryEntryTypeEnum, { message: 'Type must be Milestone or Event' })
  type: HistoryEntryTypeEnum;
}
