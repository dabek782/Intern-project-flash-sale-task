import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TicketType, TicketStatus } from '@prisma/client';

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(TicketType)
  @IsOptional()
  type?: TicketType;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsNumber()
  @IsOptional()
  companyId?: number;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
