import { ApiProperty } from '@nestjs/swagger';
import { IndicadorResponseDto } from '../../indicadores/dto/indicador-response.dto';

export class IndicadorCalculadoResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ type: () => IndicadorResponseDto })
  indicador!: IndicadorResponseDto;

  @ApiProperty()
  ano!: number;

  @ApiProperty()
  codMunicipio!: string;

  @ApiProperty({ nullable: true })
  valorNumerico?: number;

  @ApiProperty({ nullable: true })
  unidadeMedida?: string;

  @ApiProperty({ nullable: true })
  valorPercentual?: number;
}
