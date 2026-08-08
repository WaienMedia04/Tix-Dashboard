import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { FONDOS_MURAL_IDS_GRATIS } from '../mural-fondos.constant';
import { COLORES_NOMBRE_MURAL_IDS_GRATIS } from '../mural-colores-nombre.constant';
import { COLOR_WIDGETS_IDS } from '../mural-color-widgets.constant';
import { MASCOTA_IDS_GRATIS } from '../mural-mascota.constant';
import {
  MODOS_ENCABEZADO_MURAL_IDS,
  TAMANOS_CUADRO_MURAL_IDS,
} from '../mural-encabezado.constant';
import { MARCOS_CUADRO_IDS_GRATIS } from '../mural-marco-cuadro.constant';

export class ActualizarPerfilMuralDto {
  @IsString()
  @IsOptional()
  @MaxLength(40)
  apodo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  meGusta?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  noMeGusta?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  cancionFavorita?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  superpoder?: string;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  personalidades?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(40)
  estado?: string;

  /** Solo fondos gratis — los comprados en la Tienda se equipan vía TiendaService (ya valida que el talento los haya comprado). */
  @IsString()
  @IsOptional()
  @IsIn(FONDOS_MURAL_IDS_GRATIS)
  fondoId?: string;

  /** Solo colores gratis — los comprados en la Tienda se equipan vía TiendaService (ya valida que el talento los haya comprado). */
  @IsString()
  @IsOptional()
  @IsIn(COLORES_NOMBRE_MURAL_IDS_GRATIS)
  colorNombreId?: string;

  @IsString()
  @IsOptional()
  @IsIn(COLOR_WIDGETS_IDS)
  colorWidgetsId?: string;

  /**
   * Mascota tipo Clippy elegida — null explícito para quitarla. Solo las
   * gratis se pueden poner acá directamente; las compradas en la Tienda se
   * equipan vía TiendaService (ya valida que el talento las haya comprado).
   */
  @IsOptional()
  @ValidateIf((o: ActualizarPerfilMuralDto) => o.mascotaId !== null)
  @IsIn(MASCOTA_IDS_GRATIS)
  mascotaId?: string | null;

  /** Nombre propio que el talento le puso a su mascota — null explícito para quitarlo. */
  @IsOptional()
  @ValidateIf((o: ActualizarPerfilMuralDto) => o.mascotaNombre !== null)
  @IsString()
  @MaxLength(30)
  mascotaNombre?: string | null;

  /** "lanyard" (carnet colgante, por defecto) o "cuadro" (foto enmarcada). */
  @IsString()
  @IsOptional()
  @IsIn(MODOS_ENCABEZADO_MURAL_IDS)
  modoEncabezado?: string;

  /** Solo aplica cuando modoEncabezado es "cuadro". */
  @IsString()
  @IsOptional()
  @IsIn(TAMANOS_CUADRO_MURAL_IDS)
  cuadroTamano?: string;

  /**
   * Marco del cuadro de foto — null explícito para quitarlo. Solo los
   * gratis se pueden poner acá directamente; los comprados en la Tienda se
   * equipan vía TiendaService (ya valida que el talento los haya comprado).
   */
  @IsOptional()
  @ValidateIf((o: ActualizarPerfilMuralDto) => o.cuadroMarcoId !== null)
  @IsIn(MARCOS_CUADRO_IDS_GRATIS)
  cuadroMarcoId?: string | null;
}
