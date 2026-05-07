import { ApiProperty } from '@nestjs/swagger';

class IndicadorBriefDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  nome!: string;

  @ApiProperty()
  direcaoInterpretativa!: string;

  @ApiProperty()
  status!: string;
}

export class RankingResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ type: () => IndicadorBriefDto })
  indicador!: IndicadorBriefDto;

  @ApiProperty()
  codMunicipio!: string;

  @ApiProperty()
  ano!: number;

  @ApiProperty()
  posicaoRankingValor!: number;

  @ApiProperty({ nullable: true })
  posicaoRankingPercentual!: number | null;
}
