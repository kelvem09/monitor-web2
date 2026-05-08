import { ApiProperty } from '@nestjs/swagger';

export class OdsResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  numeroOds!: number;

  @ApiProperty()
  temaOds!: string;
}
