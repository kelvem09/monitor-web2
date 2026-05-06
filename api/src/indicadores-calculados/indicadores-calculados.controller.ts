import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { IndicadoresCalculadosService } from './indicadores-calculados.service';
import { IndicadorCalculadoQueryDto } from './dto/indicador-calculado-query.dto';
import { IndicadorCalculadoResponseDto } from './dto/indicador-calculado-response.dto';

@ApiTags('Indicadores Calculados')
@Controller('indicadores-calculados')
export class IndicadoresCalculadosController {
  constructor(
    private readonly indicadoresCalculadosService: IndicadoresCalculadosService,
  ) {}

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
}

