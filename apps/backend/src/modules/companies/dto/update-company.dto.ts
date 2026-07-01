import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  description?: string;


  @IsString()
  @IsOptional()
  createdBy?: string;
   
  @IsString()
  @IsOptional()
  updatedBy?: string;

}
