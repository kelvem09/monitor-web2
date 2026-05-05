import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Estado } from './estados/entities/estado.entity';
import { Municipio } from './municipios/entities/municipio.entity';
import { EstadosModule } from './estados/estados.module';
import { MunicipiosModule } from './municipios/municipios.module';
import { SeedModule } from './database/seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [User, Estado, Municipio],
      synchronize: true,
      dropSchema: true,
    }),
    UsersModule,
    AuthModule,
    EstadosModule,
    MunicipiosModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
