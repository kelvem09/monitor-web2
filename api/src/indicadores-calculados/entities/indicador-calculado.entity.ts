import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Indicador } from '../../indicadores/entities/indicador.entity';

@Entity('indicador_calculado')
@Index(['ano'])
@Index(['codMunicipio'])
@Index(['indicador', 'ano', 'codMunicipio'])
@Unique(['indicador', 'ano', 'codMunicipio'])
export class IndicadorCalculado {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Indicador, (indicador) => indicador.indicadoresCalculados, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'id_indicador' })
  indicador!: Indicador;

  @Column()
  ano!: number;

  @Column({ name: 'cod_municipio' })
  codMunicipio!: string;

  @Column({ name: 'valor_numerico', type: 'float', nullable: true })
  valorNumerico!: number;

  @Column({ name: 'unidade_medida', nullable: true })
  unidadeMedida!: string;

  @Column({ name: 'valor_percentual', type: 'float', nullable: true })
  valorPercentual!: number;
}
