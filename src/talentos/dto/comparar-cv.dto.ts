import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CompararCvDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(6000)
  descripcionPuesto!: string;
}
