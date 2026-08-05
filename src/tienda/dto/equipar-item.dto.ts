import { IsIn, IsOptional, IsString } from 'class-validator';
import type { TipoItemTienda } from '../tienda.service';

export class EquiparItemDto {
  @IsIn(['marco', 'titulo', 'fondo'])
  tipo!: TipoItemTienda;

  /** null desequipa. */
  @IsString()
  @IsOptional()
  itemId?: string | null;
}
