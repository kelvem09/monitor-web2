import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ColunaBase } from './coluna-base.entity';

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

  @OneToMany(() => ColunaBase, (coluna) => coluna.base)
  colunas: ColunaBase[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
