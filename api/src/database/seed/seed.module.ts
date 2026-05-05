import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estado } from '../../estados/entities/estado.entity';
import { Municipio } from '../../municipios/entities/municipio.entity';
import { User } from '../../users/entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Estado, Municipio, User])],
  providers: [SeedService],
})
export class SeedModule {}
