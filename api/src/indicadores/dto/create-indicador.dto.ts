import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DirecaoInterpretativa } from '../entities/direcao-interpretativa.enum';

export class CreateIndicadorDto {
  @ApiProperty()
  @IsBoolean()
  previstoOds!: boolean;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  metaOds?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  numeroOds?: number;

  @ApiProperty()
  @IsString()
  nome!: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ description: 'ID do tema do indicador' })
  @IsNumber()
  temaId!: number;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  fonte?: string;

  @ApiProperty({ enum: DirecaoInterpretativa, required: false, nullable: true })
  @IsOptional()
  @IsEnum(DirecaoInterpretativa)
  direcaoInterpretativa?: DirecaoInterpretativa;

  @ApiProperty({ default: 'ATIVO' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: [1] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  basesDadosIds?: number[];
}