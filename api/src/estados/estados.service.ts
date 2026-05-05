import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado } from './entities/estado.entity';

@Injectable()
export class EstadosService {
  constructor(
    @InjectRepository(Estado)
    private readonly estadosRepository: Repository<Estado>,
  ) {}

  findAll(): Promise<Estado[]> {
    return this.estadosRepository.find({ order: { nome: 'ASC' } });
  }
}
