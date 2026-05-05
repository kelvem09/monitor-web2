import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TemaIndicadorService } from './tema-indicador.service';
import { TemaIndicadorResponseDto } from './dto/tema-indicador-response.dto';

@ApiTags('Temas de Indicadores')
@Controller('temas-indicadores')
export class TemaIndicadorController {
  constructor(private readonly temaIndicadorService: TemaIndicadorService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os temas de indicadores' })
  @ApiOkResponse({ type: TemaIndicadorResponseDto, isArray: true })
  findAll(): Promise<TemaIndicadorResponseDto[]> {
    return this.temaIndicadorService.findAll();
  }
}
