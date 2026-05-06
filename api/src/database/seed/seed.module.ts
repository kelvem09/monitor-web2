import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estado } from '../../estados/entities/estado.entity';
import { Municipio } from '../../municipios/entities/municipio.entity';
import { User } from '../../users/entities/user.entity';
import { BaseDados } from '../../bases/entities/base-dados.entity';
import { Sinasc } from '../../sinasc/entities/sinasc.entity';
import { Sim } from '../../sim/entities/sim.entity';
import { TemaIndicador } from '../../tema-indicador/entities/tema-indicador.entity';
import { Indicador } from '../../indicadores/entities/indicador.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Estado, Municipio, User, BaseDados, Sinasc, Sim, TemaIndicador, Indicador]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
