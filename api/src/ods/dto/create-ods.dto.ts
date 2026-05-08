import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateOdsDto {
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numeroOds!: number;

  @ApiProperty({ example: 'Saúde e bem-estar' })
  @IsString()
  @IsNotEmpty()
  temaOds!: string;
}
