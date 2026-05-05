import { ApiProperty } from '@nestjs/swagger';

export class SinascResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  contador: number;

  @ApiProperty()
  ano: number;

  @ApiProperty({ nullable: true })
  locnasc: string;

  @ApiProperty({ nullable: true })
  codmunnasc: string;

  @ApiProperty({ nullable: true })
  idademae: number;

  @ApiProperty({ nullable: true })
  estcivmae: string;

  @ApiProperty({ nullable: true })
  escmae: string;

  @ApiProperty({ nullable: true })
  codocupmae: string;

  @ApiProperty({ nullable: true })
  qtdfilvivo: number;

  @ApiProperty({ nullable: true })
  qtdfilmort: number;

  @ApiProperty({ nullable: true })
  codmunres: string;

  @ApiProperty({ nullable: true })
  gestacao: string;

  @ApiProperty({ nullable: true })
  gravidez: string;

  @ApiProperty({ nullable: true })
  parto: string;

  @ApiProperty({ nullable: true })
  consultas: string;

  @ApiProperty({ nullable: true })
  dtnasc: string;

  @ApiProperty({ nullable: true })
  sexo: string;

  @ApiProperty({ nullable: true })
  apgar1: number;

  @ApiProperty({ nullable: true })
  apgar5: number;

  @ApiProperty({ nullable: true })
  racacor: string;

  @ApiProperty({ nullable: true })
  peso: number;

  @ApiProperty({ nullable: true })
  codestab: string;

  @ApiProperty({ nullable: true })
  naturalmae: string;

  @ApiProperty({ nullable: true })
  codmunnatu: string;

  @ApiProperty({ nullable: true })
  tpnascassi: string;

  @ApiProperty({ nullable: true })
  consprenat: number;

  @ApiProperty({ nullable: true })
  mesprenat: number;

  @ApiProperty({ nullable: true })
  idanomal: string;

  @ApiProperty({ nullable: true })
  semagestac: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
