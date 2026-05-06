import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseDados } from './entities/base-dados.entity';

@Injectable()
export class BasesService {
  constructor(
    @InjectRepository(BaseDados)
    private readonly baseDadosRepository: Repository<BaseDados>,
  ) {}

  findAll(): Promise<BaseDados[]> {
    return this.baseDadosRepository.find({ order: { sigla: 'ASC' } });
  }
}
