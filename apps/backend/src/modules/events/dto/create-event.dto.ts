import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EventStatus } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  eventVenue!: string;

  @IsString()
  @IsNotEmpty()
  venueAddress!: string;

  @IsEnum(EventStatus)
  status!: EventStatus;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsNotEmpty()
  companyId!: number;
}
