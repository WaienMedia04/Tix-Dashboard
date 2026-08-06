import {
  IsBoolean,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class ActualizarEstampaDefinicionDto {
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  /** null explícito la quita de la Tienda (sigue existiendo para regalar). */
  @IsOptional()
  @ValidateIf((o: ActualizarEstampaDefinicionDto) => o.precio !== null)
  @IsInt()
  @Min(1)
  @Max(20000)
  precio?: number | null;
}
