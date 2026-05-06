import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndicadorCalculado } from './entities/indicador-calculado.entity';
import { Indicador } from '../indicadores/entities/indicador.entity';
import { IndicadorCalculadoQueryDto } from './dto/indicador-calculado-query.dto';

interface NascimentoHospitalarRow {
  ano: number;
  codMunicipio: string;
  totalNascidosVivos: number;
  totalHospitalar: number;
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
    if (id !== 1) {
      throw new BadRequestException(
        `Indicador ${id} ainda não possui rotina de processamento`,
      );
    }
    return this.processarNascimentoHospitalar(indicador, ano);
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
          unidadeMedida: 'nascidos vivos',
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
}

