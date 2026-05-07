import { ApiProperty } from '@nestjs/swagger';

export class TemaIndicadorResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  nome!: string;
}
