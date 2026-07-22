import { IsInt, Min } from 'class-validator';

export class VotarEncuestaDto {
  @IsInt()
  @Min(0)
  opcionIndex!: number;
}
