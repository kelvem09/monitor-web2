import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Indicador } from './entities/indicador.entity';
import { TemaIndicador } from '../tema-indicador/entities/tema-indicador.entity';
import { IndicadoresController } from './indicadores.controller';
import { IndicadoresService } from './indicadores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Indicador, TemaIndicador])],
  controllers: [IndicadoresController],
  providers: [IndicadoresService],
  exports: [IndicadoresService],
})
export class IndicadoresModule {}
