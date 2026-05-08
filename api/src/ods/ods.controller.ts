import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { OdsService } from './ods.service';
import { CreateOdsDto } from './dto/create-ods.dto';
import { UpdateOdsDto } from './dto/update-ods.dto';
import { OdsResponseDto } from './dto/ods-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/role.enum';

@ApiTags('ODS')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('ods')
export class OdsController {
  constructor(private readonly odsService: OdsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os ODS (ADMIN)' })
  @ApiOkResponse({ type: OdsResponseDto, isArray: true })
  findAll(): Promise<OdsResponseDto[]> {
    return this.odsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ODS por ID (ADMIN)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: OdsResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<OdsResponseDto> {
    return this.odsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar ODS (ADMIN)' })
  @ApiCreatedResponse({ type: OdsResponseDto })
  create(@Body() dto: CreateOdsDto): Promise<OdsResponseDto> {
    return this.odsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ODS (ADMIN)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ type: OdsResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOdsDto,
  ): Promise<OdsResponseDto> {
    return this.odsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover ODS (ADMIN)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({ description: 'ODS removido com sucesso' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.odsService.remove(id);
  }
}
