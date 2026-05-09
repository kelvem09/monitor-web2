import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IndicadoresCalculadosService } from './indicadores-calculados.service';
import { IndicadorCalculadoQueryDto } from './dto/indicador-calculado-query.dto';
import { IndicadorCalculadoResponseDto } from './dto/indicador-calculado-response.dto';
import { UserRole } from '../users/entities/role.enum';

@ApiTags('Indicadores Calculados')
@Controller('indicadores-calculados')
export class IndicadoresCalculadosController {
  constructor(
    private readonly indicadoresCalculadosService: IndicadoresCalculadosService,
  ) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('processar/:id')
  @ApiOperation({ summary: 'Processar indicador calculado pelo id do indicador' })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  processar(
    @Param('id', ParseIntPipe) id: number,
    @Query('ano') ano?: string,
  ) {
    let anoNumero: number | undefined;
    if (ano !== undefined) {
      anoNumero = Number(ano);
      if (isNaN(anoNumero)) {
        throw new BadRequestException(
          'O parâmetro ano deve ser um número válido',
        );
      }
    }
    return this.indicadoresCalculadosService.processarIndicador(id, anoNumero);
  }

  @Delete('limpar')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Limpar indicadores calculados. Se indicadorId for informado, remove apenas os registros daquele indicador; caso contrário, limpa toda a tabela.' })
  @ApiQuery({ name: 'indicadorId', required: false, type: Number })
  limpar(@Query('indicadorId') indicadorId?: string) {
    let id: number | undefined;
    if (indicadorId !== undefined) {
      id = Number(indicadorId);
      if (isNaN(id)) {
        throw new BadRequestException('O parâmetro indicadorId deve ser um número válido');
      }
    }
    return this.indicadoresCalculadosService.limpar(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar indicadores calculados com filtros',
  })
  @ApiOkResponse({ type: IndicadorCalculadoResponseDto, isArray: true })
  @ApiQuery({ name: 'indicadorId', required: false, type: Number })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  @ApiQuery({ name: 'codMunicipio', required: false, type: String })
  findAll(@Query() query: IndicadorCalculadoQueryDto) {
    return this.indicadoresCalculadosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar indicador calculado por ID',
  })
  @ApiOkResponse({
    type: IndicadorCalculadoResponseDto,
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.indicadoresCalculadosService.findOne(id);
  }
}

