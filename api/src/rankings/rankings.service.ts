import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ranking } from './entities/ranking.entity';
import { Indicador } from '../indicadores/entities/indicador.entity';
import { IndicadorCalculado } from '../indicadores-calculados/entities/indicador-calculado.entity';
import { RankingQueryDto } from './dto/ranking-query.dto';
import { RankingResponseDto } from './dto/ranking-response.dto';

export interface ProcessarResult {
  indicadorId: number;
  indicadorNome: string;
  anosProcessados: number[];
  totalRegistrosGerados: number;
}

interface RankingRow {
  ano: number;
  codMunicipio: string;
  posicaoRankingValor: number;
  posicaoRankingPercentual: number | null;
}

@Injectable()
export class RankingsService {
  constructor(
    @InjectRepository(Ranking)
    private readonly rankingRepository: Repository<Ranking>,
    @InjectRepository(Indicador)
    private readonly indicadorRepository: Repository<Indicador>,
    @InjectRepository(IndicadorCalculado)
    private readonly indicadorCalculadoRepository: Repository<IndicadorCalculado>,
  ) {}

  async processarRanking(indicadorId: number, ano?: number): Promise<ProcessarResult> {
    const indicador = await this.indicadorRepository.findOne({ where: { id: indicadorId } });
    if (!indicador) {
      throw new NotFoundException(`Indicador com id ${indicadorId} não encontrado`);
    }

    const direcao = this.resolverDirecao(indicador.direcaoInterpretativa);
    const orderDir = direcao === 'MAIOR_MELHOR' ? 'DESC' : 'ASC';

    let anos: number[];
    if (ano !== undefined) {
      anos = [ano];
    } else {
      const rows: { ano: number }[] = await this.indicadorCalculadoRepository
        .createQueryBuilder('ic')
        .select('DISTINCT ic.ano', 'ano')
        .where('ic.indicador = :indicadorId', { indicadorId })
        .orderBy('ic.ano', 'ASC')
        .getRawMany();
      anos = rows.map((r) => Number(r.ano));
    }

    let totalRegistrosGerados = 0;
    const manager = this.rankingRepository.manager;

    for (const anoAtual of anos) {
      await this.rankingRepository.delete({ indicador: { id: indicadorId }, ano: anoAtual });

      const rows: RankingRow[] = await manager.query(
        `SELECT
          ic.ano AS ano,
          ic.cod_municipio AS codMunicipio,
          RANK() OVER (
            PARTITION BY ic.id_indicador, ic.ano
            ORDER BY ic.valor_numerico ${orderDir}
          ) AS posicaoRankingValor,
          RANK() OVER (
            PARTITION BY ic.id_indicador, ic.ano
            ORDER BY ic.valor_percentual ${orderDir}
          ) AS posicaoRankingPercentual
        FROM indicador_calculado ic
        WHERE ic.id_indicador = ?
          AND ic.ano = ?
          AND ic.valor_numerico IS NOT NULL`,
        [indicadorId, anoAtual],
      );

      if (rows.length === 0) continue;

      const entities: Ranking[] = rows
        .filter((row) => row.codMunicipio)
        .map((row) => {
          const entity = this.rankingRepository.create();
          entity.indicador = indicador;
          entity.codMunicipio = String(row.codMunicipio);
          entity.ano = Number(row.ano);
          entity.posicaoRankingValor = Number(row.posicaoRankingValor);
          entity.posicaoRankingPercentual =
            row.posicaoRankingPercentual !== null && row.posicaoRankingPercentual !== undefined
              ? Number(row.posicaoRankingPercentual)
              : null;
          return entity;
        });

      await this.rankingRepository.insert(entities);
      totalRegistrosGerados += entities.length;
    }

    return {
      indicadorId: indicador.id,
      indicadorNome: indicador.nome,
      anosProcessados: anos,
      totalRegistrosGerados,
    };
  }

  async findAll(query: RankingQueryDto): Promise<RankingResponseDto[]> {
    const qb = this.rankingRepository
      .createQueryBuilder('r')
      .innerJoin('r.indicador', 'indicador')
      .leftJoin(
        'indicador_calculado',
        'ic',
        'ic.id_indicador = indicador.id AND ic.ano = r.ano AND ic.cod_municipio = r.cod_municipio',
      )
      .select('r.id', 'id')
      .addSelect('indicador.id', 'indicadorId')
      .addSelect('r.codMunicipio', 'codMunicipio')
      .addSelect('r.ano', 'ano')
      .addSelect('r.posicaoRankingValor', 'posicaoRankingValor')
      .addSelect('r.posicaoRankingPercentual', 'posicaoRankingPercentual')
      .addSelect('ic.valor_numerico', 'valorNumerico')
      .addSelect('ic.valor_percentual', 'valorPercentual');

    if (query.indicadorId) {
      qb.andWhere('indicador.id = :indicadorId', { indicadorId: query.indicadorId });
    }
    if (query.ano) {
      qb.andWhere('r.ano = :ano', { ano: query.ano });
    }
    if (query.codMunicipio) {
      qb.andWhere('r.codMunicipio = :codMunicipio', { codMunicipio: query.codMunicipio });
    }

    qb.orderBy('r.ano', 'DESC')
      .addOrderBy('indicador.id', 'ASC')
      .addOrderBy('r.posicaoRankingValor', 'ASC');

    const rows = await qb.getRawMany<{
      id: number;
      indicadorId: number;
      codMunicipio: string;
      ano: number;
      posicaoRankingValor: number;
      posicaoRankingPercentual: number | null;
      valorNumerico: number | null;
      valorPercentual: number | null;
    }>();

    return rows.map((row) => ({
      id: Number(row.id),
      indicadorId: Number(row.indicadorId),
      codMunicipio: String(row.codMunicipio),
      ano: Number(row.ano),
      posicaoRankingValor: Number(row.posicaoRankingValor),
      posicaoRankingPercentual:
        row.posicaoRankingPercentual !== null && row.posicaoRankingPercentual !== undefined
          ? Number(row.posicaoRankingPercentual)
          : null,
      valorNumerico:
        row.valorNumerico !== null && row.valorNumerico !== undefined
          ? Number(row.valorNumerico)
          : null,
      valorPercentual:
        row.valorPercentual !== null && row.valorPercentual !== undefined
          ? Number(row.valorPercentual)
          : null,
    }));
  }

  private resolverDirecao(direcao: string | null | undefined): 'MAIOR_MELHOR' | 'MENOR_MELHOR' {
    if (!direcao) return 'MAIOR_MELHOR';
    const lower = direcao.toLowerCase();
    if (lower.includes('menor') && lower.includes('melhor')) return 'MENOR_MELHOR';
    return 'MAIOR_MELHOR';
  }
}
