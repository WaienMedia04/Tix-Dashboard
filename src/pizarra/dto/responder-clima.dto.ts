import { IsIn } from 'class-validator';
import { EmojiClima } from '@prisma/client';

const EMOJIS_CLIMA: EmojiClima[] = [
  'FELIZ',
  'NEUTRAL',
  'TRISTE',
  'CANSADO',
  'EMOCIONADO',
];

export class ResponderClimaDto {
  @IsIn(EMOJIS_CLIMA)
  emoji!: EmojiClima;
}
