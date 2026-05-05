import { ApiProperty } from '@nestjs/swagger';
import { EstadoResponseDto } from '../../estados/dto/estado-response.dto';

export class MunicipioResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigoIbge: number;

  @ApiProperty()
  nome: string;

  @ApiProperty({ type: () => EstadoResponseDto })
  estado: EstadoResponseDto;
}
