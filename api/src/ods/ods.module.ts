import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ods } from './entities/ods.entity';
import { OdsController } from './ods.controller';
import { OdsService } from './ods.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ods])],
  controllers: [OdsController],
  providers: [OdsService],
  exports: [OdsService],
})
export class OdsModule {}
