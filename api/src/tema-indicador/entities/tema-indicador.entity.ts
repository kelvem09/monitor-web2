import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Indicador } from '../../indicadores/entities/indicador.entity';

@Entity('tema_indicador')
export class TemaIndicador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nome: string;

  @OneToMany(() => Indicador, (indicador) => indicador.tema)
  indicadores: Indicador[];
}
