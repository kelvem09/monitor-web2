import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TemaIndicador } from '../../tema-indicador/entities/tema-indicador.entity';

@Entity('indicador')
export class Indicador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'previsto_ods', default: false })
  previstoOds: boolean;

  @Column({ name: 'meta_ods', nullable: true })
  metaOds: string;

  @Column({ name: 'numero_ods', nullable: true })
  numeroOds: number;

  @Column()
  nome: string;

  @Column({ nullable: true })
  descricao: string;

  @ManyToOne(() => TemaIndicador, (tema) => tema.indicadores, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'tema_id' })
  tema: TemaIndicador;

  @Column({ nullable: true })
  fonte: string;

  @Column({ name: 'direcao_interpretativa', nullable: true })
  direcaoInterpretativa: string;

  @Column({ default: 'ATIVO' })
  status: string;
}
