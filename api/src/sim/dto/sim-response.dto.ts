import { ApiProperty } from '@nestjs/swagger';

export class SimResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  contador: number;

  @ApiProperty()
  ano: number;

  @ApiProperty({ nullable: true })
  origem: string;

  @ApiProperty({ nullable: true })
  tipobito: string;

  @ApiProperty({ nullable: true })
  dtobito: string;

  @ApiProperty({ nullable: true })
  horaobito: string;

  @ApiProperty({ nullable: true })
  natural: string;

  @ApiProperty({ nullable: true })
  codmunnatu: string;

  @ApiProperty({ nullable: true })
  dtnasc: string;

  @ApiProperty({ nullable: true })
  idade: string;

  @ApiProperty({ nullable: true })
  sexo: string;

  @ApiProperty({ nullable: true })
  racacor: string;

  @ApiProperty({ nullable: true })
  estciv: string;

  @ApiProperty({ nullable: true })
  esc: string;

  @ApiProperty({ nullable: true })
  esc2010: string;

  @ApiProperty({ nullable: true })
  ocup: string;

  @ApiProperty({ nullable: true })
  codmunres: string;

  @ApiProperty({ nullable: true })
  lococor: string;

  @ApiProperty({ nullable: true })
  causabas: string;

  @ApiProperty({ nullable: true })
  causabas_o: string;

  @ApiProperty({ nullable: true })
  peso: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
