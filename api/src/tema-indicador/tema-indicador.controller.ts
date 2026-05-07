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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { TemaIndicadorService } from './tema-indicador.service';
import { TemaIndicadorResponseDto } from './dto/tema-indicador-response.dto';
import { CreateTemaIndicadorDto } from './dto/create-tema-indicador.dto';
import { UpdateTemaIndicadorDto } from './dto/update-tema-indicador.dto';

import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { UserRole } from '../users/entities/role.enum';

@ApiTags('Temas de Indicadores')
@Controller('temas-indicadores')
export class TemaIndicadorController {
  constructor(private readonly temaIndicadorService: TemaIndicadorService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os temas de indicadores',
  })
  @ApiOkResponse({
    type: TemaIndicadorResponseDto,
    isArray: true,
  })
  findAll(): Promise<TemaIndicadorResponseDto[]> {
    return this.temaIndicadorService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar tema de indicador por ID',
  })
  @ApiOkResponse({
    type: TemaIndicadorResponseDto,
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TemaIndicadorResponseDto | null> {
    return this.temaIndicadorService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar tema de indicador (ADMIN)',
  })
  @ApiCreatedResponse({
    type: TemaIndicadorResponseDto,
  })
  create(
    @Body() dto: CreateTemaIndicadorDto,
  ): Promise<TemaIndicadorResponseDto> {
    return this.temaIndicadorService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar tema de indicador (ADMIN)',
  })
  @ApiOkResponse({
    type: TemaIndicadorResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemaIndicadorDto,
  ): Promise<TemaIndicadorResponseDto | null> {
    return this.temaIndicadorService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remover tema de indicador (ADMIN)',
  })
  @ApiOkResponse({
    description: 'Tema removido com sucesso',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.temaIndicadorService.remove(id);
  }
}
