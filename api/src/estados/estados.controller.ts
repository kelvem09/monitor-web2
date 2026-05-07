import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EstadosService } from './estados.service';
import { EstadoResponseDto } from './dto/estado-response.dto';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { AuthGuard } from '../auth/auth.guard';

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

  @Get(':id')
  @ApiOperation({ summary: 'Buscar estado por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: EstadoResponseDto })
  @ApiResponse({ status: 404, description: 'Estado não encontrado' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<EstadoResponseDto> {
    return this.estadosService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar novo estado' })
  @ApiResponse({ status: 201, type: EstadoResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 409, description: 'Código ou UF já cadastrados' })
  create(@Body() dto: CreateEstadoDto): Promise<EstadoResponseDto> {
    return this.estadosService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar dados de um estado' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: EstadoResponseDto })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 404, description: 'Estado não encontrado' })
  @ApiResponse({ status: 409, description: 'Código ou UF já cadastrados' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoDto,
  ): Promise<EstadoResponseDto> {
    return this.estadosService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um estado' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Estado removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 404, description: 'Estado não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Estado possui municípios vinculados',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.estadosService.remove(id);
  }
}
