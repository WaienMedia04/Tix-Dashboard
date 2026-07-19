import { IsBoolean, IsOptional } from 'class-validator';

export class ActualizarEstampaDefinicionDto {
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
