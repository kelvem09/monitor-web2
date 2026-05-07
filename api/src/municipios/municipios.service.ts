import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Municipio } from './entities/municipio.entity';
import { Estado } from '../estados/entities/estado.entity';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';

@Injectable()
export class MunicipiosService {
  constructor(
    @InjectRepository(Municipio)
    private readonly municipiosRepository: Repository<Municipio>,
    @InjectRepository(Estado)
    private readonly estadosRepository: Repository<Estado>,
  ) {}

  findAll(): Promise<Municipio[]> {
    return this.municipiosRepository.find({ order: { nome: 'ASC' } });
  }

  async findById(id: number): Promise<Municipio> {
    const municipio = await this.municipiosRepository.findOne({
      where: { id },
    });
    if (!municipio) {
      throw new NotFoundException(`Município com ID ${id} não encontrado.`);
    }
    return municipio;
  }

  async create(dto: CreateMunicipioDto): Promise<Municipio> {
    await this.assertCodigoIbgeUnique(dto.codigoIbge);
    const estado = await this.findEstadoOrFail(dto.estadoId);
    const municipio = this.municipiosRepository.create({
      codigoIbge: dto.codigoIbge,
      nome: dto.nome,
      estado,
    });
    return this.municipiosRepository.save(municipio);
  }

  async update(id: number, dto: UpdateMunicipioDto): Promise<Municipio> {
    const municipio = await this.findById(id);
    if (dto.codigoIbge !== undefined) {
      await this.assertCodigoIbgeUnique(dto.codigoIbge, id);
      municipio.codigoIbge = dto.codigoIbge;
    }
    if (dto.nome !== undefined) {
      municipio.nome = dto.nome;
    }
    if (dto.estadoId !== undefined) {
      municipio.estado = await this.findEstadoOrFail(dto.estadoId);
    }
    return this.municipiosRepository.save(municipio);
  }

  async remove(id: number): Promise<void> {
    const municipio = await this.findById(id);
    await this.municipiosRepository.remove(municipio);
  }

  private async findEstadoOrFail(estadoId: number): Promise<Estado> {
    const estado = await this.estadosRepository.findOne({
      where: { id: estadoId },
    });
    if (!estado) {
      throw new NotFoundException(`Estado com ID ${estadoId} não encontrado.`);
    }
    return estado;
  }

  private async assertCodigoIbgeUnique(
    codigoIbge: number,
    ignoreId?: number,
  ): Promise<void> {
    const exists = await this.municipiosRepository.findOne({
      where: {
        codigoIbge,
        ...(ignoreId !== undefined ? { id: Not(ignoreId) } : {}),
      },
    });
    if (exists) {
      throw new ConflictException(
        `Já existe um município com o código IBGE ${codigoIbge}.`,
      );
    }
  }
}
