import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Indicador } from './entities/indicador.entity';
import { TemaIndicador } from '../tema-indicador/entities/tema-indicador.entity';
import { BaseDados } from '../bases/entities/base-dados.entity';
import { Ods } from '../ods/entities/ods.entity';
import { IndicadoresController } from './indicadores.controller';
import { IndicadoresService } from './indicadores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Indicador, TemaIndicador, BaseDados, Ods])],
  controllers: [IndicadoresController],
  providers: [IndicadoresService],
  exports: [IndicadoresService],
})
export class IndicadoresModule {}
