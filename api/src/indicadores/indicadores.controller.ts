import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IndicadoresService } from './indicadores.service';
import { IndicadorResponseDto } from './dto/indicador-response.dto';

@ApiTags('Indicadores')
@Controller('indicadores')
export class IndicadoresController {
  constructor(private readonly indicadoresService: IndicadoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os indicadores' })
  @ApiOkResponse({ type: IndicadorResponseDto, isArray: true })
  findAll(): Promise<IndicadorResponseDto[]> {
    return this.indicadoresService.findAll();
  }
}
