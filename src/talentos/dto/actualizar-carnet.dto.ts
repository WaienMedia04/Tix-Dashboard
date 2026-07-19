import { IsOptional, IsUrl } from 'class-validator';

export class ActualizarCarnetDto {
  @IsOptional()
  @IsUrl()
  carnetFotoUrl?: string | null;
}
