import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateMunicipioDto {
  @ApiProperty({ example: 2304400, description: 'Código IBGE do município' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  codigoIbge: number;

  @ApiProperty({ example: 'Fortaleza', description: 'Nome do município' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    example: 1,
    description: 'ID do estado ao qual o município pertence',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estadoId: number;
}
