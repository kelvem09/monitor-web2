import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';
import { Estado } from '../../estados/entities/estado.entity';
import { Municipio } from '../../municipios/entities/municipio.entity';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/role.enum';

interface EstadoSeedData {
  codigo: number;
  nome: string;
  uf: string;
}

interface MunicipioSeedData {
  codigo_ibge: number;
  nome: string;
  id_estado: number;
}

interface UserSeedData {
  name: string;
  email: string;
  password: string;
  role: string;
}

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Estado)
    private readonly estadosRepository: Repository<Estado>,
    @InjectRepository(Municipio)
    private readonly municipiosRepository: Repository<Municipio>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedUsers();
    await this.seedMunicipios();
  }

  private async seedUsers(): Promise<void> {
    const usersData: UserSeedData[] = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf-8'),
    );

    for (const userData of usersData) {
      const existing = await this.usersRepository.findOne({
        where: { email: userData.email },
      });

      if (!existing) {
        const hashed = await bcrypt.hash(userData.password, 10);
        const user = this.usersRepository.create({
          name: userData.name,
          email: userData.email,
          password: hashed,
          role: userData.role as UserRole,
        });
        await this.usersRepository.save(user);
      }
    }
  }

  private async seedMunicipios(): Promise<void> {
    const count = await this.municipiosRepository.count();
    if (count > 0) {
      return;
    }

    const estadosData: EstadoSeedData[] = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'data', 'estados.json'),
        'utf-8',
      ),
    );

    const municipiosData: MunicipioSeedData[] = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'data', 'municipios-rn.json'),
        'utf-8',
      ),
    );

    const estadosPersistidos: Record<number, Estado> = {};

    for (const estadoData of estadosData) {
      let estado = await this.estadosRepository.findOne({
        where: { uf: estadoData.uf },
      });

      if (!estado) {
        estado = this.estadosRepository.create(estadoData);
        estado = await this.estadosRepository.save(estado);
      }

      estadosPersistidos[estado.id] = estado;
    }

    for (const municipioData of municipiosData) {
      const estado = estadosPersistidos[municipioData.id_estado];
      if (!estado) {
        continue;
      }

      const municipio = this.municipiosRepository.create({
        codigoIbge: municipioData.codigo_ibge,
        nome: municipioData.nome,
        estado,
      });

      await this.municipiosRepository.save(municipio);
    }
  }
}
