import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Indicador } from '../../indicadores/entities/indicador.entity';

@Entity('ods')
export class Ods {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'numero_ods', unique: true })
  numeroOds!: number;

  @Column({ name: 'tema_ods' })
  temaOds!: string;

  @OneToMany(() => Indicador, (indicador) => indicador.ods)
  indicadores!: Indicador[];
}
