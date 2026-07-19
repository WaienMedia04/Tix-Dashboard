import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class ActualizarPosicionEstampaDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  posX?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  posY?: number;

  @IsInt()
  @IsOptional()
  zIndex?: number;
}
