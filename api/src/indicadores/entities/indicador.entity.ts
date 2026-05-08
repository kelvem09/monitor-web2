import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { TemaIndicador } from '../../tema-indicador/entities/tema-indicador.entity';
import { IndicadorCalculado } from '../../indicadores-calculados/entities/indicador-calculado.entity';
import { DirecaoInterpretativa } from './direcao-interpretativa.enum';
import { Ranking } from '../../rankings/entities/ranking.entity';
import { BaseDados } from '../../bases/entities/base-dados.entity';
import { Ods } from '../../ods/entities/ods.entity';

@Entity('indicador')
export class Indicador {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'previsto_ods', default: false })
  previstoOds!: boolean;

  @Column({ name: 'meta_ods', nullable: true })
  metaOds!: string;

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

  @ManyToMany(() => BaseDados, (base) => base.indicadores, { eager: true })
  @JoinTable({
    name: 'indicador_base_dados',
    joinColumn: { name: 'id_indicador', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_base_dados', referencedColumnName: 'id' },
  })
  basesDados!: BaseDados[];

  @ManyToOne(() => Ods, (ods) => ods.indicadores, { nullable: true, eager: true })
  @JoinColumn({ name: 'id_ods' })
  ods!: Ods | null;
}
