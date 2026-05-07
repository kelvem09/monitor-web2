import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@ApiTags('Usuários')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todos os usuários cadastrados',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Token não informado ou inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado',
  })
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar usuário por ID (ADMIN)',
  })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto | null> {
    return this.usersService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar usuário (ADMIN)',
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
  })
  create(
    @Body() dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar usuário (ADMIN)',
  })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto | null> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Desativar usuário (ADMIN)',
  })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto | null> {
    return this.usersService.remove(id);
  }
}
