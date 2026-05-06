import { ApiProperty } from '@nestjs/swagger';
import { TemaIndicadorResponseDto } from '../../tema-indicador/dto/tema-indicador-response.dto';
import { DirecaoInterpretativa } from '../entities/direcao-interpretativa.enum';

export class IndicadorResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  previstoOds!: boolean;

  @ApiProperty({ nullable: true })
  metaOds?: string;

  @ApiProperty({ nullable: true })
  numeroOds?: number;

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
}
