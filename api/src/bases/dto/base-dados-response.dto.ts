import { ApiProperty } from '@nestjs/swagger';

export class BaseDadosResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  sigla: string;

  @ApiProperty({ nullable: true })
  descricao: string;

  @ApiProperty()
  ativa: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
