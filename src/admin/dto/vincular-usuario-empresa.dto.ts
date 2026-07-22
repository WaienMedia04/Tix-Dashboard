import { IsEmail } from 'class-validator';

export class VincularUsuarioEmpresaDto {
  @IsEmail()
  email!: string;
}
