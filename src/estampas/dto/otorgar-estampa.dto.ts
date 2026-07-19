import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class OtorgarEstampaDto {
  @IsString()
  @IsNotEmpty()
  talentoId!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  mensaje?: string;
}
