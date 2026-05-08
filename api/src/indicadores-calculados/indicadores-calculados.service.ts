import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndicadorCalculado } from './entities/indicador-calculado.entity';
import { Indicador } from '../indicadores/entities/indicador.entity';
import { IndicadorCalculadoQueryDto } from './dto/indicador-calculado-query.dto';
import { RankingsService } from '../rankings/rankings.service';

interface NascimentoHospitalarRow {
  ano: number;
  codMunicipio: string;
  totalNascidosVivos: number;
  totalHospitalar: number;
  valorPercentual: number;
}

interface NascidosNaoResidentesRow {
  ano: number;
  codMunicipio: string;
  totalNaoResidentes: number;
  totalNascidosEstado: number;
  valorPercentual: number;
}

interface MortalidadeAte5AnosRow {
  codMunicipio: string;
  ano: number;
  totalObitosAte5: number;
  totalNascidosVivos: number;
  valorPercentual: number;
}

interface NascidosMaes10a14Row {
  codMunicipio: string;
  ano: number;
  totalMaes10a14: number;
  totalNascidosVivos: number;
  valorPercentual: number;
}

interface NascidosMaes15a19Row {
  codMunicipio: string;
  ano: number;
  totalMaes15a19: number;
  totalNascidosVivos: number;
  valorPercentual: number;
}

export interface ProcessarResult {
  indicadorId: number;
  indicadorNome: string;
  anosProcessados: number[];
  totalRegistrosGerados: number;
}

@Injectable()
export class IndicadoresCalculadosService {
  constructor(
    @InjectRepository(IndicadorCalculado)
    private readonly indicadorCalculadoRepository: Repository<IndicadorCalculado>,
    @InjectRepository(Indicador)
    private readonly indicadorRepository: Repository<Indicador>,
    private readonly rankingsService: RankingsService,
  ) {}

  findRepository(): Repository<IndicadorCalculado> {
    return this.indicadorCalculadoRepository;
  }

  createEntity(data: Partial<IndicadorCalculado>): IndicadorCalculado {
    return this.indicadorCalculadoRepository.create(data);
  }

  async processarIndicador(id: number, ano?: number): Promise<ProcessarResult> {
    const indicador = await this.indicadorRepository.findOne({ where: { id } });
    if (!indicador) {
      throw new NotFoundException(`Indicador com id ${id} não encontrado`);
    }
    let result: ProcessarResult;
    if (id === 1) {
      result = await this.processarNascimentoHospitalar(indicador, ano);
    } else if (id === 2) {
      result = await this.processarNascidosNaoResidentes(indicador, ano);
    } else if (id === 3) {
      result = await this.processarMortalidadeAte5Anos(indicador, ano);
    } else if (id === 4) {
      result = await this.processarNascidosMaes10a14(indicador, ano);
    } else if (id === 5) {
      result = await this.processarNascidosMaes15a19(indicador, ano);
    } else {
      throw new BadRequestException(
        `Indicador ${id} ainda não possui rotina de processamento`,
      );
    }
    await this.rankingsService.processarRanking(id, ano);
    return result;
  }

  private async processarNascimentoHospitalar(
    indicador: Indicador,
    ano?: number,
  ): Promise<ProcessarResult> {
    const manager = this.indicadorCalculadoRepository.manager;

    let anos: number[];
    if (ano !== undefined) {
      anos = [ano];
    } else {
      const rows: { ano: number }[] = await manager.query(
        `SELECT DISTINCT ano FROM sinasc ORDER BY ano`,
      );
      anos = rows.map((r) => Number(r.ano));
    }

    let totalRegistrosGerados = 0;

    for (const anoAtual of anos) {
      const rows: NascimentoHospitalarRow[] = await manager.query(
        `SELECT
          s.ano AS ano,
          CAST(m.codigoIbge AS TEXT) AS codMunicipio,
          COUNT(*) AS totalNascidosVivos,
          SUM(CASE WHEN s.locnasc = '1' THEN 1 ELSE 0 END) AS totalHospitalar,
          CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE (SUM(CASE WHEN s.locnasc = '1' THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
          END AS valorPercentual
        FROM sinasc s
        INNER JOIN municipios m
          ON s.codmunres = SUBSTR(CAST(m.codigoIbge AS TEXT), 1, 6)
        WHERE s.ano = ?
        GROUP BY s.ano, m.codigoIbge`,
        [anoAtual],
      );

      await manager.query(
        `DELETE FROM indicador_calculado WHERE id_indicador = ? AND ano = ?`,
        [indicador.id, anoAtual],
      );

      if (rows.length === 0) continue;

      const entities = rows.map((row) =>
        this.indicadorCalculadoRepository.create({
          indicador,
          ano: Number(row.ano),
          codMunicipio: String(row.codMunicipio),
          valorNumerico: Number(row.totalHospitalar ?? 0),
          unidadeMedida: 'nascidos vivos em hospitais',
          valorPercentual: Number(row.valorPercentual ?? 0),
        }),
      );

      await this.indicadorCalculadoRepository.insert(entities);
      totalRegistrosGerados += entities.length;
    }

    return {
      indicadorId: indicador.id,
      indicadorNome: indicador.nome,
      anosProcessados: anos,
      totalRegistrosGerados,
    };
  }

  private async processarNascidosNaoResidentes(
    indicador: Indicador,
    ano?: number,
  ): Promise<ProcessarResult> {
    const manager = this.indicadorCalculadoRepository.manager;

    let anos: number[];
    if (ano !== undefined) {
      anos = [ano];
    } else {
      const rows: { ano: number }[] = await manager.query(
        `SELECT DISTINCT ano FROM sinasc ORDER BY ano`,
      );
      anos = rows.map((r) => Number(r.ano));
    }

    let totalRegistrosGerados = 0;

    for (const anoAtual of anos) {
      await manager.query(
        `DELETE FROM indicador_calculado WHERE id_indicador = ? AND ano = ?`,
        [indicador.id, anoAtual],
      );

      const rows: NascidosNaoResidentesRow[] = await manager.query(
        `SELECT
          s.ano AS ano,
          CAST(m.codigoIbge AS TEXT) AS codMunicipio,
          SUM(
            CASE
              WHEN s.codmunres IS NOT NULL
               AND s.codmunnasc IS NOT NULL
               AND s.codmunres <> s.codmunnasc
              THEN 1
              ELSE 0
            END
          ) AS totalNaoResidentes,
          total_estado.totalNascidosEstado AS totalNascidosEstado,
          CASE
            WHEN total_estado.totalNascidosEstado = 0 THEN 0
            ELSE (
              SUM(
                CASE
                  WHEN s.codmunres IS NOT NULL
                   AND s.codmunnasc IS NOT NULL
                   AND s.codmunres <> s.codmunnasc
                  THEN 1
                  ELSE 0
                END
              ) * 100.0 / total_estado.totalNascidosEstado
            )
          END AS valorPercentual
        FROM sinasc s
        INNER JOIN municipios m
          ON s.codmunnasc = SUBSTR(CAST(m.codigoIbge AS TEXT), 1, 6)
        INNER JOIN (
          SELECT
            ano,
            COUNT(*) AS totalNascidosEstado
          FROM sinasc
          WHERE ano = ?
          GROUP BY ano
        ) total_estado
          ON total_estado.ano = s.ano
        WHERE s.ano = ?
          AND s.codmunnasc IS NOT NULL
        GROUP BY s.ano, m.codigoIbge, total_estado.totalNascidosEstado`,
        [anoAtual, anoAtual],
      );

      if (rows.length === 0) continue;

      const entities = rows.map((row) =>
        this.indicadorCalculadoRepository.create({
          indicador,
          ano: Number(row.ano),
          codMunicipio: String(row.codMunicipio),
          valorNumerico: Number(row.totalNaoResidentes ?? 0),
          unidadeMedida: 'nascidos e não residentes',
          valorPercentual: Number(row.valorPercentual ?? 0),
        }),
      );

      await this.indicadorCalculadoRepository.insert(entities);
      totalRegistrosGerados += entities.length;
    }

    return {
      indicadorId: indicador.id,
      indicadorNome: indicador.nome,
      anosProcessados: anos,
      totalRegistrosGerados,
    };
  }

  private async processarMortalidadeAte5Anos(
    indicador: Indicador,
    ano?: number,
  ): Promise<ProcessarResult> {
    const manager = this.indicadorCalculadoRepository.manager;

    let anos: number[];
    if (ano !== undefined) {
      anos = [ano];
    } else {
      const rows: { ano: number }[] = await manager.query(
        `SELECT DISTINCT ano FROM sim ORDER BY ano`,
      );
      anos = rows.map((r) => Number(r.ano));
    }

    let totalRegistrosGerados = 0;

    for (const anoAtual of anos) {
      await manager.query(
        `DELETE FROM indicador_calculado WHERE id_indicador = ? AND ano = ?`,
        [indicador.id, anoAtual],
      );

      const rows: MortalidadeAte5AnosRow[] = await manager.query(
        `SELECT
          CAST(m.codigoIbge AS TEXT) AS codMunicipio,
          obitos.ano AS ano,
          obitos.totalObitosAte5 AS totalObitosAte5,
          COALESCE(nascidos.totalNascidosVivos, 0) AS totalNascidosVivos,
          CASE
            WHEN COALESCE(nascidos.totalNascidosVivos, 0) = 0 THEN 0
            ELSE (obitos.totalObitosAte5 * 1000.0 / nascidos.totalNascidosVivos)
          END AS valorPercentual
        FROM municipios m
        INNER JOIN (
          SELECT
            s.ano AS ano,
            s.codmunres AS codmunres,
            COUNT(*) AS totalObitosAte5
          FROM sim s
          WHERE s.ano = ?
            AND s.codmunres IS NOT NULL
            AND s.dtobito IS NOT NULL
            AND s.dtnasc IS NOT NULL
            AND LENGTH(s.dtobito) = 8
            AND LENGTH(s.dtnasc) = 8
            AND (
              CAST(SUBSTR(s.dtobito, 5, 4) AS INTEGER)
              - CAST(SUBSTR(s.dtnasc, 5, 4) AS INTEGER)
              - CASE
                  WHEN SUBSTR(s.dtobito, 3, 2) || SUBSTR(s.dtobito, 1, 2)
                    < SUBSTR(s.dtnasc, 3, 2) || SUBSTR(s.dtnasc, 1, 2)
                  THEN 1
                  ELSE 0
                END
            ) <= 5
          GROUP BY s.ano, s.codmunres
        ) obitos
          ON obitos.codmunres = SUBSTR(CAST(m.codigoIbge AS TEXT), 1, 6)
        LEFT JOIN (
          SELECT
            sn.ano AS ano,
            sn.codmunres AS codmunres,
            COUNT(*) AS totalNascidosVivos
          FROM sinasc sn
          WHERE sn.ano = ?
            AND sn.codmunres IS NOT NULL
          GROUP BY sn.ano, sn.codmunres
        ) nascidos
          ON nascidos.ano = obitos.ano
          AND nascidos.codmunres = obitos.codmunres`,
        [anoAtual, anoAtual],
      );

      if (rows.length === 0) continue;

      const entities = rows.map((row) =>
        this.indicadorCalculadoRepository.create({
          indicador,
          ano: Number(row.ano),
          codMunicipio: String(row.codMunicipio),
          valorNumerico: Number(row.totalObitosAte5 ?? 0),
          valorPercentual: Number(row.valorPercentual ?? 0),
        }),
      );

      await this.indicadorCalculadoRepository.insert(entities);
      totalRegistrosGerados += entities.length;
    }

    return {
      indicadorId: indicador.id,
      indicadorNome: indicador.nome,
      anosProcessados: anos,
      totalRegistrosGerados,
    };
  }

  private async processarNascidosMaes10a14(
    indicador: Indicador,
    ano?: number,
  ): Promise<ProcessarResult> {
    const manager = this.indicadorCalculadoRepository.manager;

    let anos: number[];
    if (ano !== undefined) {
      anos = [ano];
    } else {
      const rows: { ano: number }[] = await manager.query(
        `SELECT DISTINCT ano FROM sinasc ORDER BY ano`,
      );
      anos = rows.map((r) => Number(r.ano));
    }

    let totalRegistrosGerados = 0;

    for (const anoAtual of anos) {
      await manager.query(
        `DELETE FROM indicador_calculado WHERE id_indicador = ? AND ano = ?`,
        [indicador.id, anoAtual],
      );

      const rows: NascidosMaes10a14Row[] = await manager.query(
        `SELECT
          CAST(m.codigoIbge AS TEXT) AS codMunicipio,
          s.ano AS ano,
          SUM(CASE WHEN s.idademae >= 10 AND s.idademae <= 14 THEN 1 ELSE 0 END) AS totalMaes10a14,
          COUNT(*) AS totalNascidosVivos,
          CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE (SUM(CASE WHEN s.idademae >= 10 AND s.idademae <= 14 THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
          END AS valorPercentual
        FROM sinasc s
        INNER JOIN municipios m
          ON s.codmunres = SUBSTR(CAST(m.codigoIbge AS TEXT), 1, 6)
        WHERE s.ano = ?
          AND s.idademae IS NOT NULL
        GROUP BY s.ano, m.codigoIbge`,
        [anoAtual],
      );

      if (rows.length === 0) continue;

      const entities = rows.map((row) =>
        this.indicadorCalculadoRepository.create({
          indicador,
          ano: Number(row.ano),
          codMunicipio: String(row.codMunicipio),
          valorNumerico: Number(row.totalMaes10a14 ?? 0),
          unidadeMedida: 'nascidos vivos de mães de 10 a 14 anos',
          valorPercentual: Number(row.valorPercentual ?? 0),
        }),
      );

      await this.indicadorCalculadoRepository.insert(entities);
      totalRegistrosGerados += entities.length;
    }

    return {
      indicadorId: indicador.id,
      indicadorNome: indicador.nome,
      anosProcessados: anos,
      totalRegistrosGerados,
    };
  }

  private async processarNascidosMaes15a19(
    indicador: Indicador,
    ano?: number,
  ): Promise<ProcessarResult> {
    const manager = this.indicadorCalculadoRepository.manager;

    let anos: number[];
    if (ano !== undefined) {
      anos = [ano];
    } else {
      const rows: { ano: number }[] = await manager.query(
        `SELECT DISTINCT ano FROM sinasc ORDER BY ano`,
      );
      anos = rows.map((r) => Number(r.ano));
    }

    let totalRegistrosGerados = 0;

    for (const anoAtual of anos) {
      await manager.query(
        `DELETE FROM indicador_calculado WHERE id_indicador = ? AND ano = ?`,
        [indicador.id, anoAtual],
      );

      const rows: NascidosMaes15a19Row[] = await manager.query(
        `SELECT
          CAST(m.codigoIbge AS TEXT) AS codMunicipio,
          s.ano AS ano,
          SUM(CASE WHEN s.idademae >= 15 AND s.idademae <= 19 THEN 1 ELSE 0 END) AS totalMaes15a19,
          COUNT(*) AS totalNascidosVivos,
          CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE (SUM(CASE WHEN s.idademae >= 15 AND s.idademae <= 19 THEN 1 ELSE 0 END) * 100.0 / COUNT(*))
          END AS valorPercentual
        FROM sinasc s
        INNER JOIN municipios m
          ON s.codmunres = SUBSTR(CAST(m.codigoIbge AS TEXT), 1, 6)
        WHERE s.ano = ?
          AND s.idademae IS NOT NULL
        GROUP BY s.ano, m.codigoIbge`,
        [anoAtual],
      );

      if (rows.length === 0) continue;

      const entities = rows.map((row) =>
        this.indicadorCalculadoRepository.create({
          indicador,
          ano: Number(row.ano),
          codMunicipio: String(row.codMunicipio),
          valorNumerico: Number(row.totalMaes15a19 ?? 0),
          unidadeMedida: 'nascidos vivos de mães de 15 a 19 anos',
          valorPercentual: Number(row.valorPercentual ?? 0),
        }),
      );

      await this.indicadorCalculadoRepository.insert(entities);
      totalRegistrosGerados += entities.length;
    }

    return {
      indicadorId: indicador.id,
      indicadorNome: indicador.nome,
      anosProcessados: anos,
      totalRegistrosGerados,
    };
  }

  async limpar(indicadorId?: number): Promise<{ deletados: number }> {
    if (indicadorId !== undefined) {
      const result = await this.indicadorCalculadoRepository.delete({
        indicador: { id: indicadorId },
      });
      return { deletados: result.affected ?? 0 };
    }
    const result = await this.indicadorCalculadoRepository
      .createQueryBuilder()
      .delete()
      .execute();
    return { deletados: result.affected ?? 0 };
  }

  async findAll(query: IndicadorCalculadoQueryDto): Promise<IndicadorCalculado[]> {
    const qb = this.indicadorCalculadoRepository
      .createQueryBuilder('ic')
      .innerJoinAndSelect('ic.indicador', 'indicador')
      .innerJoinAndSelect('indicador.tema', 'tema');

    if (query.indicadorId) {
      qb.andWhere('indicador.id = :indicadorId', {
        indicadorId: query.indicadorId,
      });
    }
    if (query.ano) {
      qb.andWhere('ic.ano = :ano', { ano: query.ano });
    }
    if (query.codMunicipio) {
      qb.andWhere('ic.codMunicipio = :codMunicipio', {
        codMunicipio: query.codMunicipio,
      });
    }

    return qb.orderBy('ic.id', 'ASC').getMany();
  }

  async findOne(id: number): Promise<IndicadorCalculado | null> {
    return this.indicadorCalculadoRepository.findOne({
      where: { id },
      relations: ['indicador', 'indicador.tema'],
    });
  }
}

