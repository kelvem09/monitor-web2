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
import { IndicadoresService } from './indicadores.service';
import { IndicadorResponseDto } from './dto/indicador-response.dto';
import { CreateIndicadorDto } from './dto/create-indicador.dto';
import { UpdateIndicadorDto } from './dto/update-indicador.dto';
import { AuthGuard } from '../auth/auth.guard';
import { UserRole } from '../users/entities/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

console.log('DTO CLASS:', CreateIndicadorDto);

@ApiTags('Indicadores')
@Controller('indicadores')
export class IndicadoresController {
  constructor(private readonly indicadoresService: IndicadoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar indicadores ativos' })
  @ApiOkResponse({ type: IndicadorResponseDto, isArray: true })
  findAll(): Promise<IndicadorResponseDto[]> {
    return this.indicadoresService.findAll();
  }

  @Get('tema/:temaId')
  @ApiOperation({ summary: 'Listar indicadores por tema (uso público)' })
  @ApiOkResponse({ type: IndicadorResponseDto, isArray: true })
  findByTema(
    @Param('temaId', ParseIntPipe) temaId: number,
  ): Promise<IndicadorResponseDto[]> {
    return this.indicadoresService.findByTema(temaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar indicador por ID' })
  @ApiOkResponse({ type: IndicadorResponseDto })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<IndicadorResponseDto | null> {
    return this.indicadoresService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar indicador (ADMIN)' })
  @ApiCreatedResponse({ type: IndicadorResponseDto })
  create(@Body() dto: CreateIndicadorDto) {
    return this.indicadoresService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar indicador (ADMIN)' })
  @ApiOkResponse({ type: IndicadorResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIndicadorDto,
  ) {
    return this.indicadoresService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inativar indicador (soft delete - ADMIN)' })
  @ApiOkResponse({ type: IndicadorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.indicadoresService.remove(id);
  }
}
