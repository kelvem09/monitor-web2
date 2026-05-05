import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDados } from './entities/base-dados.entity';
import { ColunaBase } from './entities/coluna-base.entity';

@Injectable()
export class BasesService {
  constructor(
    @InjectRepository(BaseDados)
    private readonly baseDadosRepository: Repository<BaseDados>,
    @InjectRepository(ColunaBase)
    private readonly colunaBaseRepository: Repository<ColunaBase>,
  ) {}

  findAll(): Promise<BaseDados[]> {
    return this.baseDadosRepository.find({ order: { sigla: 'ASC' } });
  }

  async findColunasByBaseId(id: number): Promise<ColunaBase[]> {
    return this.colunaBaseRepository.find({
      where: { base: { id } },
      order: { nome: 'ASC' },
    });
  }
}
