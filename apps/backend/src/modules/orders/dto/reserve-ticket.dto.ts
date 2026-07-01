import { IsString } from 'class-validator';

export class ReserveTicketDto {
  @IsString()
  ticketId!: string;
}
