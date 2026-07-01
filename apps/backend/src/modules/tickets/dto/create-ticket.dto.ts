import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TicketType, TicketStatus } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsNotEmpty()
  price!: number;

  @IsNumber()
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(TicketType)
  type!: TicketType;

  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @IsNumber()
  @IsNotEmpty()
  companyId!: number;

  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status!: TicketStatus;
}
