import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Estado } from './estados/entities/estado.entity';
import { Municipio } from './municipios/entities/municipio.entity';
import { EstadosModule } from './estados/estados.module';
import { MunicipiosModule } from './municipios/municipios.module';
import { SeedModule } from './database/seed/seed.module';
import { BaseDados } from './bases/entities/base-dados.entity';
import { ColunaBase } from './bases/entities/coluna-base.entity';
import { BasesModule } from './bases/bases.module';
import { Sinasc } from './sinasc/entities/sinasc.entity';
import { SinascModule } from './sinasc/sinasc.module';
import { Sim } from './sim/entities/sim.entity';
import { SimModule } from './sim/sim.module';
import { TemaIndicador } from './tema-indicador/entities/tema-indicador.entity';
import { Indicador } from './indicadores/entities/indicador.entity';
import { TemaIndicadorModule } from './tema-indicador/tema-indicador.module';
import { IndicadoresModule } from './indicadores/indicadores.module';
import { IndicadorCalculado } from './indicadores-calculados/entities/indicador-calculado.entity';
import { IndicadoresCalculadosModule } from './indicadores-calculados/indicadores-calculados.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [User, Estado, Municipio, BaseDados, ColunaBase, Sinasc, Sim, TemaIndicador, Indicador, IndicadorCalculado],
      synchronize: true,
      dropSchema: true,
    }),
    UsersModule,
    AuthModule,
    EstadosModule,
    MunicipiosModule,
    BasesModule,
    SinascModule,
    SimModule,
    TemaIndicadorModule,
    IndicadoresModule,
    IndicadoresCalculadosModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
