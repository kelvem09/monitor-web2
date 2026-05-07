import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemaIndicador } from './entities/tema-indicador.entity';
import { CreateTemaIndicadorDto } from './dto/create-tema-indicador.dto';
import { UpdateTemaIndicadorDto } from './dto/update-tema-indicador.dto';

@Injectable()
export class TemaIndicadorService {
  constructor(
    @InjectRepository(TemaIndicador)
    private readonly temaIndicadorRepository: Repository<TemaIndicador>,
  ) {}

 findAll(): Promise<TemaIndicador[]> {
    return this.temaIndicadorRepository.find({
      order: { nome: 'ASC' },
    });
  }

  findOne(id: number): Promise<TemaIndicador | null> {
    return this.temaIndicadorRepository.findOne({
      where: { id },
      relations: ['indicadores'],
    });
  }

  async create(
    data: CreateTemaIndicadorDto,
  ): Promise<TemaIndicador> {
    const tema = this.temaIndicadorRepository.create(data);

    return this.temaIndicadorRepository.save(tema);
  }

  async update(
    id: number,
    data: UpdateTemaIndicadorDto,
  ): Promise<TemaIndicador | null> {
    const tema = await this.temaIndicadorRepository.findOneBy({ id });

    if (!tema) {
      return null;
    }

    Object.assign(tema, data);

    return this.temaIndicadorRepository.save(tema);
  }

  async remove(id: number): Promise<void> {
    const tema = await this.temaIndicadorRepository.findOne({
      where: { id },
      relations: ['indicadores'],
    });

    if (!tema) {
      return;
    }

    if (tema.indicadores.length > 0) {
      throw new BadRequestException(
        'Tema possui indicadores vinculados',
      );
    }

    await this.temaIndicadorRepository.remove(tema);
  }
}
