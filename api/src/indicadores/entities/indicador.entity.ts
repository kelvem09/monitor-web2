import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TemaIndicador } from '../../tema-indicador/entities/tema-indicador.entity';
import { IndicadorCalculado } from '../../indicadores-calculados/entities/indicador-calculado.entity';
import { DirecaoInterpretativa } from './direcao-interpretativa.enum';
import { Ranking } from '../../rankings/entities/ranking.entity';

@Entity('indicador')
export class Indicador {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'previsto_ods', default: false })
  previstoOds!: boolean;

  @Column({ name: 'meta_ods', nullable: true })
  metaOds!: string;

  @Column({ name: 'numero_ods', nullable: true })
  numeroOds!: number;

  @Column()
  nome!: string;

  @Column({ nullable: true })
  descricao!: string;

  @ManyToOne(() => TemaIndicador, (tema) => tema.indicadores, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'tema_id' })
  tema!: TemaIndicador;

  @Column({ nullable: true })
  fonte!: string;

  @Column({ name: 'direcao_interpretativa', type: 'simple-enum', enum: DirecaoInterpretativa, nullable: true })
  direcaoInterpretativa!: DirecaoInterpretativa;

  @Column({ default: 'ATIVO' })
  status!: string;

  @OneToMany(() => IndicadorCalculado, (calc) => calc.indicador)
  indicadoresCalculados!: IndicadorCalculado[];

  @OneToMany(() => Ranking, (ranking) => ranking.indicador)
  rankings!: Ranking[];
}
