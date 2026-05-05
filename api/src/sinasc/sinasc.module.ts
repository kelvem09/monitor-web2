import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sinasc } from './entities/sinasc.entity';
import { SinascService } from './sinasc.service';
import { SinascController } from './sinasc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sinasc])],
  providers: [SinascService],
  controllers: [SinascController],
})
export class SinascModule {}
