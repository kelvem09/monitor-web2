import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EstadosService } from './estados.service';
import { EstadoResponseDto } from './dto/estado-response.dto';

@ApiTags('Estados')
@Controller('estados')
export class EstadosController {
  constructor(private readonly estadosService: EstadosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os estados' })
  @ApiOkResponse({ type: EstadoResponseDto, isArray: true })
  findAll(): Promise<EstadoResponseDto[]> {
    return this.estadosService.findAll();
  }
}
