import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Estado } from '../../estados/entities/estado.entity';
import { GestorMunicipal } from '../../users/entities/gestor-municipal.entity';

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

  @OneToOne(() => GestorMunicipal, (gestorMunicipal) => gestorMunicipal.municipio, { nullable: true })
  gestorMunicipal: GestorMunicipal | null;
}
