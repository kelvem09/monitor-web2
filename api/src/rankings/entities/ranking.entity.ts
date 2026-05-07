import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Indicador } from '../../indicadores/entities/indicador.entity';

@Entity('ranking')
@Index(['ano'])
@Index(['codMunicipio'])
@Index(['indicador', 'ano', 'codMunicipio'])
@Unique(['indicador', 'ano', 'codMunicipio'])
export class Ranking {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Indicador, (indicador) => indicador.rankings, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'id_indicador' })
  indicador!: Indicador;

  @Column({ name: 'cod_municipio' })
  codMunicipio!: string;

  @Column()
  ano!: number;

  @Column({ name: 'posicao_ranking_valor' })
  posicaoRankingValor!: number;

  @Column({ name: 'posicao_ranking_percentual', nullable: true, type: 'float' })
  posicaoRankingPercentual!: number | null;
}
