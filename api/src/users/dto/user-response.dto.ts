import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/role.entity';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Administrador' })
  name: string;

  @ApiProperty({ example: 'admin@monitor.com' })
  email: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
