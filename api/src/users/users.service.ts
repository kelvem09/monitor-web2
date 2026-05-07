import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { GestorMunicipal } from './entities/gestor-municipal.entity';
import { Municipio } from '../municipios/entities/municipio.entity';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(GestorMunicipal)
    private readonly gestorRepository: Repository<GestorMunicipal>,
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
  ) {}

  private toDto(user: User, gestor?: GestorMunicipal | null): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
      municipio: gestor?.municipio
        ? { id: gestor.municipio.id, codigoIbge: gestor.municipio.codigoIbge, nome: gestor.municipio.nome }
        : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    const gestores = await this.gestorRepository.find({
      where: { ativo: true },
      relations: ['usuario'],
    });
    const gestorByUserId = new Map(gestores.map((g) => [g.usuario?.id, g]));
    return users.map((u) => this.toDto(u, gestorByUserId.get(u.id) ?? null));
  }

  async findById(id: number): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;

    const gestor = await this.gestorRepository.findOne({
      where: { usuario: { id }, ativo: true },
      relations: ['usuario'],
    });

    return this.toDto(user, gestor ?? null);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    if (data.role === UserRole.GESTOR_PUBLICO) {
      if (!data.municipioId) {
        throw new BadRequestException('Município é obrigatório para usuário gestor público');
      }
    } else {
      if (data.municipioId) {
        throw new BadRequestException('Município só deve ser informado para usuário gestor público');
      }
    }

    const { municipioId, ...userData } = data;

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      isActive: userData.isActive ?? true,
    });

    const savedUser = await this.userRepository.save(user);

    let gestor: GestorMunicipal | null = null;

    if (data.role === UserRole.GESTOR_PUBLICO && municipioId) {
      const municipio = await this.municipioRepository.findOne({ where: { id: municipioId } });
      if (!municipio) {
        throw new NotFoundException('Município não encontrado');
      }

      const gestorExistente = await this.gestorRepository.findOne({
        where: { municipio: { id: municipioId }, ativo: true },
      });
      if (gestorExistente) {
        throw new BadRequestException('Município já possui gestor público vinculado');
      }

      const novoGestor = this.gestorRepository.create();
      novoGestor.usuario = savedUser;
      novoGestor.municipio = municipio;
      novoGestor.ativo = true;
      gestor = await this.gestorRepository.save(novoGestor);
    }

    return this.toDto(savedUser, gestor);
  }

  async update(id: number, data: UpdateUserDto): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;

    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new ConflictException('Já existe um usuário com este email');
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const { municipioId, ...userData } = data;
    Object.assign(user, userData);
    const updatedUser = await this.userRepository.save(user);

    const roleAtual = updatedUser.role;

    let gestor = await this.gestorRepository.findOne({
      where: { usuario: { id }, ativo: true },
      relations: ['usuario'],
    });

    if (roleAtual === UserRole.GESTOR_PUBLICO) {
      if (municipioId !== undefined) {
        const municipio = await this.municipioRepository.findOne({ where: { id: municipioId } });
        if (!municipio) {
          throw new NotFoundException('Município não encontrado');
        }

        const gestorDoMunicipio = await this.gestorRepository.findOne({
          where: { municipio: { id: municipioId }, ativo: true },
          relations: ['usuario'],
        });
        if (gestorDoMunicipio && gestorDoMunicipio.usuario?.id !== id) {
          throw new BadRequestException('Município já possui gestor público vinculado');
        }

        if (gestor) {
          gestor.municipio = municipio;
          gestor = await this.gestorRepository.save(gestor);
        } else {
          const novoGestor = this.gestorRepository.create();
          novoGestor.usuario = updatedUser;
          novoGestor.municipio = municipio;
          novoGestor.ativo = true;
          gestor = await this.gestorRepository.save(novoGestor);
        }
      }
    } else {
      if (gestor) {
        gestor.ativo = false;
        await this.gestorRepository.save(gestor);
        gestor = null;
      }
    }

    return this.toDto(updatedUser, gestor);
  }

  async remove(id: number): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;

    user.isActive = false;
    const updatedUser = await this.userRepository.save(user);

    const gestor = await this.gestorRepository.findOne({
      where: { usuario: { id }, ativo: true },
      relations: ['usuario'],
    });

    return this.toDto(updatedUser, gestor ?? null);
  }
}
