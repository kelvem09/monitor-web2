import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Municipio } from '../../municipios/entities/municipio.entity';

@Entity('gestor_municipal')
export class GestorMunicipal {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, (user) => user.gestorMunicipal, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: User;

  @OneToOne(() => Municipio, (municipio) => municipio.gestorMunicipal, { nullable: false, eager: true })
  @JoinColumn({ name: 'municipio_id' })
  municipio!: Municipio;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
