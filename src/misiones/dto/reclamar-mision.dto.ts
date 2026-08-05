import { IsString, MinLength } from 'class-validator';

export class ReclamarMisionDto {
  @IsString()
  @MinLength(1)
  misionId!: string;
}
