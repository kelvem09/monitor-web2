import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicadorCalculado } from './entities/indicador-calculado.entity';
import { Indicador } from '../indicadores/entities/indicador.entity';
import { IndicadoresCalculadosController } from './indicadores-calculados.controller';
import { IndicadoresCalculadosService } from './indicadores-calculados.service';

@Module({
  imports: [TypeOrmModule.forFeature([IndicadorCalculado, Indicador])],
  controllers: [IndicadoresCalculadosController],
  providers: [IndicadoresCalculadosService],
  exports: [IndicadoresCalculadosService],
})
export class IndicadoresCalculadosModule {}
