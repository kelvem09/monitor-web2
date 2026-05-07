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
import { MunicipiosService } from './municipios.service';
import { MunicipioResponseDto } from './dto/municipio-response.dto';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';
import { AuthGuard } from '../auth/auth.guard';

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

  @Get(':id')
  @ApiOperation({ summary: 'Buscar município por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: MunicipioResponseDto })
  @ApiResponse({ status: 404, description: 'Município não encontrado' })
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MunicipioResponseDto> {
    return this.municipiosService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar novo município' })
  @ApiResponse({ status: 201, type: MunicipioResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 404, description: 'Estado informado não encontrado' })
  @ApiResponse({ status: 409, description: 'Código IBGE já cadastrado' })
  create(@Body() dto: CreateMunicipioDto): Promise<MunicipioResponseDto> {
    return this.municipiosService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar dados de um município' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: MunicipioResponseDto })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({
    status: 404,
    description: 'Município ou estado não encontrado',
  })
  @ApiResponse({ status: 409, description: 'Código IBGE já cadastrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMunicipioDto,
  ): Promise<MunicipioResponseDto> {
    return this.municipiosService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um município' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Município removido com sucesso' })
  @ApiResponse({ status: 401, description: 'Token não informado ou inválido' })
  @ApiResponse({ status: 404, description: 'Município não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.municipiosService.remove(id);
  }
}
