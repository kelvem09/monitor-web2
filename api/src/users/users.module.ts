import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { GestorMunicipal } from './entities/gestor-municipal.entity';
import { Municipio } from '../municipios/entities/municipio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, GestorMunicipal, Municipio])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
