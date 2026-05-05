import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Unique(['contador', 'ano'])
@Index(['ano'])
@Index(['codmunres'])
@Entity('sinasc')
export class Sinasc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contador: number;

  @Column()
  ano: number;

  @Column({ nullable: true })
  locnasc: string;

  @Column({ nullable: true })
  codmunnasc: string;

  @Column({ nullable: true, type: 'integer' })
  idademae: number;

  @Column({ nullable: true })
  estcivmae: string;

  @Column({ nullable: true })
  escmae: string;

  @Column({ nullable: true })
  codocupmae: string;

  @Column({ nullable: true, type: 'integer' })
  qtdfilvivo: number;

  @Column({ nullable: true, type: 'integer' })
  qtdfilmort: number;

  @Column({ nullable: true })
  codmunres: string;

  @Column({ nullable: true })
  gestacao: string;

  @Column({ nullable: true })
  gravidez: string;

  @Column({ nullable: true })
  parto: string;

  @Column({ nullable: true })
  consultas: string;

  @Column({ nullable: true })
  dtnasc: string;

  @Column({ nullable: true })
  sexo: string;

  @Column({ nullable: true, type: 'integer' })
  apgar1: number;

  @Column({ nullable: true, type: 'integer' })
  apgar5: number;

  @Column({ nullable: true })
  racacor: string;

  @Column({ nullable: true, type: 'real' })
  peso: number;

  @Column({ nullable: true })
  codestab: string;

  @Column({ nullable: true })
  naturalmae: string;

  @Column({ nullable: true })
  codmunnatu: string;

  @Column({ nullable: true })
  tpnascassi: string;

  @Column({ nullable: true, type: 'integer' })
  consprenat: number;

  @Column({ nullable: true, type: 'integer' })
  mesprenat: number;

  @Column({ nullable: true })
  idanomal: string;

  @Column({ nullable: true })
  semagestac: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
