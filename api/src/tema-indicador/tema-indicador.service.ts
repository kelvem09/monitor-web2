import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemaIndicador } from './entities/tema-indicador.entity';

@Injectable()
export class TemaIndicadorService {
  constructor(
    @InjectRepository(TemaIndicador)
    private readonly temaIndicadorRepository: Repository<TemaIndicador>,
  ) {}

  findAll(): Promise<TemaIndicador[]> {
    return this.temaIndicadorRepository.find({ order: { nome: 'ASC' } });
  }
}
