import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Indicador } from './entities/indicador.entity';
import { CreateIndicadorDto } from './dto/create-indicador.dto';
import { UpdateIndicadorDto } from './dto/update-indicador.dto';

@Injectable()
export class IndicadoresService {
  constructor(
    @InjectRepository(Indicador)
    private readonly indicadorRepository: Repository<Indicador>,
  ) {}

  findAll(): Promise<Indicador[]> {
    return this.indicadorRepository.find({
      where: { status: 'ATIVO' },
      relations: ['tema'],
      order: { nome: 'ASC' },
    });
  }

  findAllAdmin(): Promise<Indicador[]> {
    return this.indicadorRepository.find({
      relations: ['tema'],
      order: { nome: 'ASC' },
    });
  }

  findOne(id: number): Promise<Indicador | null> {
    return this.indicadorRepository.findOne({
      where: { id },
      relations: ['tema', 'indicadoresCalculados'],
    });
  }

  async create(data: CreateIndicadorDto): Promise<Indicador> {
    const indicador = this.indicadorRepository.create({
      ...data,
      tema: { id: data.temaId } as any,
      status: data.status ?? 'ATIVO',
    });
    
    return this.indicadorRepository.save(indicador);
  }

  async update(id: number, data: UpdateIndicadorDto): Promise<Indicador | null> {
    const indicador = await this.indicadorRepository.findOneBy({ id });

    if (!indicador) return null;

    Object.assign(indicador, {
      ...data,
      tema: data.temaId
        ? ({ id: data.temaId } as any)
        : indicador.tema,
    });

    return this.indicadorRepository.save(indicador);
  }

  async remove(id: number): Promise<Indicador | null> {
    const indicador = await this.indicadorRepository.findOneBy({ id });

    if (!indicador) return null;

    indicador.status = 'INATIVO';

    return this.indicadorRepository.save(indicador);
  }

  async restore(id: number): Promise<Indicador | null> {
    const indicador = await this.indicadorRepository.findOneBy({ id });

    if (!indicador) return null;

    indicador.status = 'ATIVO';

    return this.indicadorRepository.save(indicador);
  }

  findByTema(temaId: number): Promise<Indicador[]> {
    return this.indicadorRepository.find({
      where: {
        tema: { id: temaId },
        status: 'ATIVO',
      },
      relations: ['tema'],
      order: { nome: 'ASC' },
    });
  }
}
