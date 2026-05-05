import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemaIndicador } from './entities/tema-indicador.entity';
import { TemaIndicadorController } from './tema-indicador.controller';
import { TemaIndicadorService } from './tema-indicador.service';

@Module({
  imports: [TypeOrmModule.forFeature([TemaIndicador])],
  controllers: [TemaIndicadorController],
  providers: [TemaIndicadorService],
  exports: [TemaIndicadorService],
})
export class TemaIndicadorModule {}
