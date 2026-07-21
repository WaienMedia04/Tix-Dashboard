import { IsNotEmpty, IsString } from 'class-validator';

export class CrearDepartamentoAdminDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}
