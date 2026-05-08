import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Ods } from './entities/ods.entity';
import { CreateOdsDto } from './dto/create-ods.dto';
import { UpdateOdsDto } from './dto/update-ods.dto';

@Injectable()
export class OdsService {
  constructor(
    @InjectRepository(Ods)
    private readonly odsRepository: Repository<Ods>,
  ) {}

  async create(dto: CreateOdsDto): Promise<Ods> {
    const existing = await this.odsRepository.findOne({ where: { numeroOds: dto.numeroOds } });
    if (existing) {
      throw new ConflictException('ODS já cadastrado');
    }
    const ods = this.odsRepository.create(dto);
    return this.odsRepository.save(ods);
  }

  findAll(): Promise<Ods[]> {
    return this.odsRepository.find({ order: { numeroOds: 'ASC' } });
  }

  async findOne(id: number): Promise<Ods> {
    const ods = await this.odsRepository.findOne({ where: { id } });
    if (!ods) {
      throw new NotFoundException(`ODS com id ${id} não encontrado`);
    }
    return ods;
  }

  async update(id: number, dto: UpdateOdsDto): Promise<Ods> {
    const ods = await this.findOne(id);
    if (dto.numeroOds !== undefined && dto.numeroOds !== ods.numeroOds) {
      const existing = await this.odsRepository.findOne({
        where: { numeroOds: dto.numeroOds, id: Not(id) },
      });
      if (existing) {
        throw new ConflictException('ODS já cadastrado');
      }
    }
    Object.assign(ods, dto);
    return this.odsRepository.save(ods);
  }

  async remove(id: number): Promise<void> {
    const ods = await this.findOne(id);
    try {
      await this.odsRepository.remove(ods);
    } catch {
      throw new ConflictException('ODS vinculado a indicador não pode ser removido');
    }
  }
}
