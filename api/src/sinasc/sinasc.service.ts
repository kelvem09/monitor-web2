import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sinasc } from './entities/sinasc.entity';
import { SinascQueryDto } from './dto/sinasc-query.dto';

@Injectable()
export class SinascService {
  constructor(
    @InjectRepository(Sinasc)
    private readonly sinascRepository: Repository<Sinasc>,
  ) {}

  async findAll(query: SinascQueryDto) {
    const { page = 1, limit = 20, ano, codmunres } = query;
    const skip = (page - 1) * limit;

    const where: Partial<Sinasc> = {};
    if (ano) where.ano = ano;
    if (codmunres) where.codmunres = codmunres;

    const [data, total] = await this.sinascRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { contador: 'ASC' },
    });

    return { data, total, page, limit };
  }

  async count(query: SinascQueryDto) {
    const { ano, codmunres } = query;
    const where: Partial<Sinasc> = {};
    if (ano) where.ano = ano;
    if (codmunres) where.codmunres = codmunres;
    const total = await this.sinascRepository.count({ where });
    return { total };
  }

  async resumo(query: { ano?: number; codmunres?: string }) {
    const { ano, codmunres } = query;

    const qb = this.sinascRepository.createQueryBuilder('s');
    if (ano) qb.andWhere('s.ano = :ano', { ano });
    if (codmunres) qb.andWhere('s.codmunres = :codmunres', { codmunres });

    const totalRegistros = await qb.getCount();

    const totalPorAno = await this.sinascRepository
      .createQueryBuilder('s')
      .select('s.ano', 'ano')
      .addSelect('COUNT(*)', 'total')
      .where(ano ? 's.ano = :ano' : '1=1', ano ? { ano } : {})
      .groupBy('s.ano')
      .orderBy('s.ano', 'ASC')
      .getRawMany();

    const result: Record<string, unknown> = { totalRegistros, totalPorAno };

    if (!codmunres) {
      const qb2 = this.sinascRepository
        .createQueryBuilder('s')
        .select('s.codmunres', 'codmunres')
        .addSelect('COUNT(*)', 'total')
        .groupBy('s.codmunres')
        .orderBy('total', 'DESC');
      if (ano) qb2.where('s.ano = :ano', { ano });
      result.totalPorMunicipioResidencia = await qb2.getRawMany();
    }

    return result;
  }
}
