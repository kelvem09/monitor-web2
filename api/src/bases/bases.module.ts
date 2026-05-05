import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseDados } from './entities/base-dados.entity';
import { ColunaBase } from './entities/coluna-base.entity';
import { BasesService } from './bases.service';
import { BasesController } from './bases.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BaseDados, ColunaBase])],
  providers: [BasesService],
  controllers: [BasesController],
  exports: [BasesService],
})
export class BasesModule {}
