import { IsEmail } from 'class-validator';

export class CambiarCorreoDto {
  @IsEmail()
  email!: string;
}
