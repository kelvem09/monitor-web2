import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/role.enum';

class MunicipioResponseBriefDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  codigoIbge!: number;

  @ApiProperty()
  nome!: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Administrador' })
  name!: string;

  @ApiProperty({ example: 'admin@monitor.com' })
  email!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  role!: UserRole;

  @ApiPropertyOptional({ type: () => MunicipioResponseBriefDto })
  municipio?: MunicipioResponseBriefDto | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
