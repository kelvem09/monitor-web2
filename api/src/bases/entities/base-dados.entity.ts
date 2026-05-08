import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Indicador } from '../../indicadores/entities/indicador.entity';

@Entity('bases_dados')
export class BaseDados {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ unique: true })
  sigla: string;

  @Column({ nullable: true })
  descricao: string;

  @Column({ default: true })
  ativa: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Indicador, (indicador) => indicador.basesDados)
  indicadores!: Indicador[];
}
