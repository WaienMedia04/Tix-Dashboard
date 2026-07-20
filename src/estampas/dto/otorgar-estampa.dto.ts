import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class OtorgarEstampaDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  talentoIds!: string[];

  @IsString()
  @IsOptional()
  @MaxLength(200)
  mensaje?: string;
}
