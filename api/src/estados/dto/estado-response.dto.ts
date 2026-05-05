import { ApiProperty } from '@nestjs/swagger';

export class EstadoResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigo: number;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  uf: string;
}
