import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ActualizarCvDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  cvUrl!: string;
}
