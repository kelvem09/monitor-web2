import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Indicador } from './entities/indicador.entity';
import { BaseDados } from '../bases/entities/base-dados.entity';
import { Ods } from '../ods/entities/ods.entity';
import { CreateIndicadorDto } from './dto/create-indicador.dto';
import { UpdateIndicadorDto } from './dto/update-indicador.dto';

@Injectable()
export class IndicadoresService {
  constructor(
    @InjectRepository(Indicador)
    private readonly indicadorRepository: Repository<Indicador>,
    @InjectRepository(BaseDados)
    private readonly baseDadosRepository: Repository<BaseDados>,
    @InjectRepository(Ods)
    private readonly odsRepository: Repository<Ods>,
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
    let basesDados: BaseDados[] = [];

    if (data.basesDadosIds && data.basesDadosIds.length > 0) {
      basesDados = await this.baseDadosRepository.findBy({ id: In(data.basesDadosIds) });
      if (basesDados.length !== data.basesDadosIds.length) {
        throw new BadRequestException('Uma ou mais bases de dados não foram encontradas');
      }
    }

    let ods: Ods | null = null;
    if (data.odsId) {
      ods = await this.odsRepository.findOne({ where: { id: data.odsId } });
      if (!ods) {
        throw new NotFoundException('ODS não encontrado');
      }
    }

    const indicador = this.indicadorRepository.create({
      ...data,
      tema: { id: data.temaId } as any,
      status: data.status ?? 'ATIVO',
      basesDados,
      ods,
    });
    
    return this.indicadorRepository.save(indicador);
  }

  async update(id: number, data: UpdateIndicadorDto): Promise<Indicador | null> {
    const indicador = await this.indicadorRepository.findOne({
      where: { id },
      relations: ['basesDados'],
    });

    if (!indicador) return null;

    Object.assign(indicador, {
      ...data,
      tema: data.temaId
        ? ({ id: data.temaId } as any)
        : indicador.tema,
    });

    if ('odsId' in data) {
      if (data.odsId === null || data.odsId === undefined) {
        indicador.ods = null;
      } else {
        const ods = await this.odsRepository.findOne({ where: { id: data.odsId } });
        if (!ods) {
          throw new NotFoundException('ODS não encontrado');
        }
        indicador.ods = ods;
      }
    }

    if (data.basesDadosIds !== undefined) {
      if (data.basesDadosIds.length > 0) {
        const bases = await this.baseDadosRepository.findBy({ id: In(data.basesDadosIds) });
        if (bases.length !== data.basesDadosIds.length) {
          throw new BadRequestException('Uma ou mais bases de dados não foram encontradas');
        }
        indicador.basesDados = bases;
      } else {
        indicador.basesDados = [];
      }
    }

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
