import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ranking } from './entities/ranking.entity';
import { Indicador } from '../indicadores/entities/indicador.entity';
import { IndicadorCalculado } from '../indicadores-calculados/entities/indicador-calculado.entity';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ranking, Indicador, IndicadorCalculado])],
  controllers: [RankingsController],
  providers: [RankingsService],
  exports: [RankingsService],
})
export class RankingsModule {}
