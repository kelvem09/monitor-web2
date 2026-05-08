import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RankingsService } from './rankings.service';
import { RankingQueryDto } from './dto/ranking-query.dto';
import { RankingResponseDto } from './dto/ranking-response.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Rankings')
@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Post('processar/:indicadorId')
  @ApiOperation({ summary: 'Processar ranking de um indicador pelo id' })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  processar(
    @Param('indicadorId', ParseIntPipe) indicadorId: number,
    @Query('ano') ano?: string,
  ) {
    let anoNumero: number | undefined;
    if (ano !== undefined) {
      anoNumero = Number(ano);
      if (isNaN(anoNumero)) {
        throw new BadRequestException('O parâmetro ano deve ser um número válido');
      }
    }
    return this.rankingsService.processarRanking(indicadorId, anoNumero);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar rankings com filtros' })
  @ApiOkResponse({ type: RankingResponseDto, isArray: true })
  @ApiQuery({ name: 'indicadorId', required: false, type: Number })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  @ApiQuery({ name: 'codMunicipio', required: false, type: String })
  findAll(@Query() query: RankingQueryDto) {
    return this.rankingsService.findAll(query);
  }
}
