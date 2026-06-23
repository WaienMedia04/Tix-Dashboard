import { IsOptional, Matches } from 'class-validator';

export class KpisQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'periodo debe tener el formato YYYY-MM',
  })
  periodo?: string;
}
