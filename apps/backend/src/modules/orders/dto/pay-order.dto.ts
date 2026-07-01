import { IsString } from 'class-validator';

export class PayOrderDto {
  @IsString()
  provider!: string;
}
