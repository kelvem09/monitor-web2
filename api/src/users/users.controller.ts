import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Usuários')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os usuários cadastrados' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }
}
