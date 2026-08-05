import { IsString, MinLength } from 'class-validator';

export class ComprarItemDto {
  @IsString()
  @MinLength(1)
  itemId!: string;
}
