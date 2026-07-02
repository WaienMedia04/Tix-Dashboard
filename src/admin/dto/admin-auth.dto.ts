import { IsNotEmpty, IsString } from 'class-validator';

export class AdminAuthDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
