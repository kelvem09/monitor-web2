import { ApiProperty } from '@nestjs/swagger';

export class RankingResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  indicadorId!: number;

  @ApiProperty()
  codMunicipio!: string;

  @ApiProperty()
  ano!: number;

  @ApiProperty()
  posicaoRankingValor!: number;

  @ApiProperty({ nullable: true })
  posicaoRankingPercentual!: number | null;

  @ApiProperty({ nullable: true })
  valorNumerico!: number | null;

  @ApiProperty({ nullable: true })
  valorPercentual!: number | null;
}
