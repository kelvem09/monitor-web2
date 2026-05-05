import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Indicador } from './entities/indicador.entity';

@Injectable()
export class IndicadoresService {
  constructor(
    @InjectRepository(Indicador)
    private readonly indicadorRepository: Repository<Indicador>,
  ) {}

  findAll(): Promise<Indicador[]> {
    return this.indicadorRepository.find({ order: { nome: 'ASC' } });
  }
}
