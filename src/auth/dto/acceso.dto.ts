import { IsNotEmpty, IsString } from 'class-validator';

export class AccesoDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;
}
