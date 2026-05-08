import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipio } from './entities/municipio.entity';
import { Estado } from '../estados/entities/estado.entity';
import { GestorMunicipal } from '../users/entities/gestor-municipal.entity';
import { MunicipiosController } from './municipios.controller';
import { MunicipiosService } from './municipios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Municipio, Estado, GestorMunicipal])],
  controllers: [MunicipiosController],
  providers: [MunicipiosService],
  exports: [MunicipiosService],
})
export class MunicipiosModule {}
