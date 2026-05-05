import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sim } from './entities/sim.entity';
import { SimService } from './sim.service';
import { SimController } from './sim.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sim])],
  providers: [SimService],
  controllers: [SimController],
})
export class SimModule {}
