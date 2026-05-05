import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MunicipiosService } from './municipios.service';
import { MunicipioResponseDto } from './dto/municipio-response.dto';

@ApiTags('Municípios')
@Controller('municipios')
export class MunicipiosController {
  constructor(private readonly municipiosService: MunicipiosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os municípios' })
  @ApiOkResponse({ type: MunicipioResponseDto, isArray: true })
  findAll(): Promise<MunicipioResponseDto[]> {
    return this.municipiosService.findAll();
  }
}
