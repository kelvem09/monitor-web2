import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SimService } from './sim.service';
import { SimQueryDto } from './dto/sim-query.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('SIM')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sim')
export class SimController {
  constructor(private readonly simService: SimService) {}

  @Get()
  @ApiOperation({ summary: 'Listar registros SIM paginados' })
  findAll(@Query() query: SimQueryDto) {
    return this.simService.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Contar registros SIM com filtros' })
  count(@Query() query: SimQueryDto) {
    return this.simService.count(query);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo agregado dos registros SIM' })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  @ApiQuery({ name: 'codmunres', required: false, type: String })
  @ApiQuery({ name: 'causabas', required: false, type: String })
  resumo(
    @Query('ano') ano?: string,
    @Query('codmunres') codmunres?: string,
    @Query('causabas') causabas?: string,
  ) {
    return this.simService.resumo({
      ano: ano ? Number(ano) : undefined,
      codmunres,
      causabas,
    });
  }
}
