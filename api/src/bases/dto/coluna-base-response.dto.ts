import { ApiProperty } from '@nestjs/swagger';

export class ColunaBaseResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  rotulo: string;

  @ApiProperty()
  tipo: string;

  @ApiProperty({ nullable: true })
  descricao: string;

  @ApiProperty()
  ativa: boolean;

  @ApiProperty()
  utilizavelIndicador: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
