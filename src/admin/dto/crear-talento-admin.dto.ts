import { IsNotEmpty, IsString } from 'class-validator';

export class CrearTalentoAdminDto {
  @IsString()
  @IsNotEmpty()
  nombreCompleto!: string;

  @IsString()
  @IsNotEmpty()
  rol!: string;
}
