import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SinascService } from './sinasc.service';
import { SinascQueryDto } from './dto/sinasc-query.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('SINASC')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sinasc')
export class SinascController {
  constructor(private readonly sinascService: SinascService) {}

  @Get()
  @ApiOperation({ summary: 'Listar registros SINASC paginados' })
  findAll(@Query() query: SinascQueryDto) {
    return this.sinascService.findAll(query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Contar registros SINASC com filtros' })
  count(@Query() query: SinascQueryDto) {
    return this.sinascService.count(query);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Resumo agregado dos registros SINASC' })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  @ApiQuery({ name: 'codmunres', required: false, type: String })
  resumo(
    @Query('ano') ano?: string,
    @Query('codmunres') codmunres?: string,
  ) {
    return this.sinascService.resumo({
      ano: ano ? Number(ano) : undefined,
      codmunres,
    });
  }
}
