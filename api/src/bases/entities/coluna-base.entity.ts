import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseDados } from './base-dados.entity';

@Entity('colunas_base')
export class ColunaBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  rotulo: string;

  @Column()
  tipo: string;

  @Column({ nullable: true })
  descricao: string;

  @Column({ default: true })
  ativa: boolean;

  @Column({ default: true })
  utilizavelIndicador: boolean;

  @ManyToOne(() => BaseDados, (base) => base.colunas, { nullable: false })
  base: BaseDados;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
