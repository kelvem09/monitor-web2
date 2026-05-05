import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Estado } from '../../estados/entities/estado.entity';

@Entity('municipios')
export class Municipio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigoIbge: number;

  @Column()
  nome: string;

  @ManyToOne(() => Estado, (estado) => estado.municipios, {
    nullable: false,
    eager: true,
  })
  @JoinColumn()
  estado: Estado;
}
