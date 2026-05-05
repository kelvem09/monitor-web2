import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipio } from './entities/municipio.entity';

@Injectable()
export class MunicipiosService {
  constructor(
    @InjectRepository(Municipio)
    private readonly municipiosRepository: Repository<Municipio>,
  ) {}

  findAll(): Promise<Municipio[]> {
    return this.municipiosRepository.find({ order: { nome: 'ASC' } });
  }
}
