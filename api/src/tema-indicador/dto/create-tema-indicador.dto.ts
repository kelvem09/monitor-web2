import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTemaIndicadorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome!: string;
}