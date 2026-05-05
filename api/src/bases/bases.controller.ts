import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BasesService } from './bases.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Bases')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('bases')
export class BasesController {
  constructor(private readonly basesService: BasesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as bases de dados' })
  findAll() {
    return this.basesService.findAll();
  }

  @Get(':id/colunas')
  @ApiOperation({ summary: 'Listar colunas de uma base pelo id' })
  findColunas(@Param('id') id: string) {
    return this.basesService.findColunasByBaseId(Number(id));
  }
}
