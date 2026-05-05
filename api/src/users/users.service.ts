import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { UserRole } from './entities/role.entity';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      isActive: u.isActive,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  private async seed(): Promise<void> {
    const existing = await this.userRepository.findOne({
      where: { email: 'admin@monitor.com' },
    });

    if (!existing) {
      const hashed = await bcrypt.hash('123456', 10);
      const admin = this.userRepository.create({
        name: 'Administrador',
        email: 'admin@monitor.com',
        password: hashed,
        role: UserRole.ADMIN,
      });
      await this.userRepository.save(admin);
    }
  }
}
