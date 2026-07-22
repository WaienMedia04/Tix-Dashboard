import { IsInt, Min } from 'class-validator';

export class ResponderTriviaDto {
  @IsInt()
  @Min(0)
  opcionIndex!: number;
}
