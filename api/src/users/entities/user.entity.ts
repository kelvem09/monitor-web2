import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { UserRole } from './role.enum';
import { GestorMunicipal } from './gestor-municipal.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'simple-enum', enum: UserRole })
  role!: UserRole;

  @OneToOne(() => GestorMunicipal, (gestorMunicipal) => gestorMunicipal.usuario, { nullable: true })
  gestorMunicipal!: GestorMunicipal | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

