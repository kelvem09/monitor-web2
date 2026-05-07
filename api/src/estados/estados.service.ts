import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Estado } from './entities/estado.entity';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

@Injectable()
export class EstadosService {
  constructor(
    @InjectRepository(Estado)
    private readonly estadosRepository: Repository<Estado>,
  ) {}

  findAll(): Promise<Estado[]> {
    return this.estadosRepository.find({ order: { nome: 'ASC' } });
  }

  async findById(id: number): Promise<Estado> {
    const estado = await this.estadosRepository.findOne({ where: { id } });
    if (!estado) {
      throw new NotFoundException(`Estado com ID ${id} não encontrado.`);
    }
    return estado;
  }

  async create(dto: CreateEstadoDto): Promise<Estado> {
    const uf = dto.uf.toUpperCase();
    await this.assertUniqueness({ codigo: dto.codigo, uf });
    const estado = this.estadosRepository.create({ ...dto, uf });
    return this.estadosRepository.save(estado);
  }

  async update(id: number, dto: UpdateEstadoDto): Promise<Estado> {
    const estado = await this.findById(id);
    const uf = dto.uf?.toUpperCase();
    await this.assertUniqueness({ codigo: dto.codigo, uf, ignoreId: id });
    Object.assign(estado, dto, uf ? { uf } : {});
    return this.estadosRepository.save(estado);
  }

  async remove(id: number): Promise<void> {
    const estado = await this.estadosRepository.findOne({
      where: { id },
      relations: { municipios: true },
    });
    if (!estado) {
      throw new NotFoundException(`Estado com ID ${id} não encontrado.`);
    }
    if (estado.municipios?.length > 0) {
      throw new ConflictException(
        'Não é possível remover um estado que possui municípios vinculados.',
      );
    }
    await this.estadosRepository.remove(estado);
  }

  private async assertUniqueness(params: {
    codigo?: number;
    uf?: string;
    ignoreId?: number;
  }): Promise<void> {
    const { codigo, uf, ignoreId } = params;
    if (codigo !== undefined) {
      const exists = await this.estadosRepository.findOne({
        where: {
          codigo,
          ...(ignoreId !== undefined ? { id: Not(ignoreId) } : {}),
        },
      });
      if (exists) {
        throw new ConflictException(
          `Já existe um estado com o código ${codigo}.`,
        );
      }
    }
    if (uf !== undefined) {
      const exists = await this.estadosRepository.findOne({
        where: {
          uf,
          ...(ignoreId !== undefined ? { id: Not(ignoreId) } : {}),
        },
      });
      if (exists) {
        throw new ConflictException(`Já existe um estado com a UF ${uf}.`);
      }
    }
  }
}
