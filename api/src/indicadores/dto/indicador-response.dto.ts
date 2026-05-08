import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemaIndicadorResponseDto } from '../../tema-indicador/dto/tema-indicador-response.dto';
import { DirecaoInterpretativa } from '../entities/direcao-interpretativa.enum';

class BaseDadosResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  nome!: string;

  @ApiProperty()
  sigla!: string;
}

class OdsSimpleDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  numeroOds!: number;

  @ApiProperty()
  temaOds!: string;
}

export class IndicadorResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  previstoOds!: boolean;

  @ApiProperty({ nullable: true })
  metaOds?: string;

  @ApiProperty()
  nome!: string;

  @ApiProperty({ nullable: true })
  descricao?: string;

  @ApiProperty({ type: () => TemaIndicadorResponseDto })
  tema!: TemaIndicadorResponseDto;

  @ApiProperty({ nullable: true })
  fonte?: string;

  @ApiProperty({ enum: DirecaoInterpretativa, nullable: true })
  direcaoInterpretativa?: DirecaoInterpretativa;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: () => [BaseDadosResponseDto] })
  basesDados!: BaseDadosResponseDto[];

  @ApiPropertyOptional({ type: () => OdsSimpleDto, nullable: true })
  ods!: OdsSimpleDto | null;
}
