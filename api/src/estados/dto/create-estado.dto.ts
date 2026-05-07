import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Length, Min } from 'class-validator';

export class CreateEstadoDto {
  @ApiProperty({ example: 23, description: 'Código IBGE do estado' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  codigo: number;

  @ApiProperty({ example: 'Ceará', description: 'Nome do estado' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'CE', description: 'Sigla do estado (2 letras)' })
  @IsString()
  @Length(2, 2)
  uf: string;
}
