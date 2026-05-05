import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sim } from './entities/sim.entity';
import { SimQueryDto } from './dto/sim-query.dto';

@Injectable()
export class SimService {
  constructor(
    @InjectRepository(Sim)
    private readonly simRepository: Repository<Sim>,
  ) {}

  async findAll(query: SimQueryDto) {
    const { page = 1, limit = 20, ano, codmunres, causabas } = query;
    const skip = (page - 1) * limit;

    const where: Partial<Sim> = {};
    if (ano) where.ano = ano;
    if (codmunres) where.codmunres = codmunres;
    if (causabas) where.causabas = causabas;

    const [data, total] = await this.simRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { contador: 'ASC' },
    });

    return { data, total, page, limit };
  }

  async count(query: SimQueryDto) {
    const { ano, codmunres, causabas } = query;
    const where: Partial<Sim> = {};
    if (ano) where.ano = ano;
    if (codmunres) where.codmunres = codmunres;
    if (causabas) where.causabas = causabas;
    const total = await this.simRepository.count({ where });
    return { total };
  }

  async resumo(query: { ano?: number; codmunres?: string; causabas?: string }) {
    const { ano, codmunres, causabas } = query;

    const qb = this.simRepository.createQueryBuilder('s');
    if (ano) qb.andWhere('s.ano = :ano', { ano });
    if (codmunres) qb.andWhere('s.codmunres = :codmunres', { codmunres });
    if (causabas) qb.andWhere('s.causabas = :causabas', { causabas });

    const totalRegistros = await qb.getCount();

    const totalPorAnoQb = this.simRepository
      .createQueryBuilder('s')
      .select('s.ano', 'ano')
      .addSelect('COUNT(*)', 'total')
      .groupBy('s.ano')
      .orderBy('s.ano', 'ASC');
    if (ano) totalPorAnoQb.where('s.ano = :ano', { ano });

    const totalPorAno = await totalPorAnoQb.getRawMany();

    const result: Record<string, unknown> = { totalRegistros, totalPorAno };

    if (!codmunres) {
      const qb2 = this.simRepository
        .createQueryBuilder('s')
        .select('s.codmunres', 'codmunres')
        .addSelect('COUNT(*)', 'total')
        .groupBy('s.codmunres')
        .orderBy('total', 'DESC');
      if (ano) qb2.where('s.ano = :ano', { ano });
      result.totalPorMunicipioResidencia = await qb2.getRawMany();
    }

    if (!causabas) {
      const qb3 = this.simRepository
        .createQueryBuilder('s')
        .select('s.causabas', 'causabas')
        .addSelect('COUNT(*)', 'total')
        .groupBy('s.causabas')
        .orderBy('total', 'DESC');
      if (ano) qb3.where('s.ano = :ano', { ano });
      result.totalPorCausaBasica = await qb3.getRawMany();
    }

    return result;
  }
}
