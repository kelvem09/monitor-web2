import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Municipio } from '../../municipios/entities/municipio.entity';

@Entity('estados')
export class Estado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: number;

  @Column()
  nome: string;

  @Column({ length: 2, unique: true })
  uf: string;

  @OneToMany(() => Municipio, (municipio) => municipio.estado)
  municipios: Municipio[];
}
