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
@Index(['causabas'])
@Entity('sim')
export class Sim {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contador: number;

  @Column({ nullable: true })
  origem: string;

  @Column({ nullable: true })
  tipobito: string;

  @Column({ nullable: true })
  dtobito: string;

  @Column({ nullable: true })
  horaobito: string;

  @Column({ nullable: true })
  natural: string;

  @Column({ nullable: true })
  codmunnatu: string;

  @Column({ nullable: true })
  dtnasc: string;

  @Column({ nullable: true })
  idade: string;

  @Column({ nullable: true })
  sexo: string;

  @Column({ nullable: true })
  racacor: string;

  @Column({ nullable: true })
  estciv: string;

  @Column({ nullable: true })
  esc: string;

  @Column({ nullable: true })
  esc2010: string;

  @Column({ nullable: true })
  seriescfal: string;

  @Column({ nullable: true })
  ocup: string;

  @Column({ nullable: true })
  codmunres: string;

  @Column({ nullable: true })
  lococor: string;

  @Column({ nullable: true })
  codestab: string;

  @Column({ nullable: true })
  codmunocor: string;

  @Column({ nullable: true })
  idademae: string;

  @Column({ nullable: true })
  escmae: string;

  @Column({ nullable: true })
  escmae2010: string;

  @Column({ nullable: true })
  seriescmae: string;

  @Column({ nullable: true })
  ocupmae: string;

  @Column({ nullable: true })
  qtdfilvivo: string;

  @Column({ nullable: true })
  qtdfilmort: string;

  @Column({ nullable: true })
  gravidez: string;

  @Column({ nullable: true })
  semagestac: string;

  @Column({ nullable: true })
  gestacao: string;

  @Column({ nullable: true })
  parto: string;

  @Column({ nullable: true })
  obitoparto: string;

  @Column({ nullable: true, type: 'real' })
  peso: number;

  @Column({ nullable: true })
  tpmorteoco: string;

  @Column({ nullable: true })
  obitograv: string;

  @Column({ nullable: true })
  obitopuerp: string;

  @Column({ nullable: true })
  assistmed: string;

  @Column({ nullable: true })
  exame: string;

  @Column({ nullable: true })
  cirurgia: string;

  @Column({ nullable: true })
  necropsia: string;

  @Column({ nullable: true })
  linhaa: string;

  @Column({ nullable: true })
  linhab: string;

  @Column({ nullable: true })
  linhac: string;

  @Column({ nullable: true })
  linhad: string;

  @Column({ nullable: true })
  linhaii: string;

  @Column({ nullable: true })
  causabas: string;

  @Column({ nullable: true, name: 'cb_pre' })
  cb_pre: string;

  @Column({ nullable: true })
  comunsvoim: string;

  @Column({ nullable: true })
  dtatestado: string;

  @Column({ nullable: true })
  circobito: string;

  @Column({ nullable: true })
  acidtrab: string;

  @Column({ nullable: true })
  fonte: string;

  @Column({ nullable: true })
  numerolote: string;

  @Column({ nullable: true })
  dtinvestig: string;

  @Column({ nullable: true })
  dtcadastro: string;

  @Column({ nullable: true })
  atestante: string;

  @Column({ nullable: true })
  stcodifica: string;

  @Column({ nullable: true })
  codificado: string;

  @Column({ nullable: true })
  versaosist: string;

  @Column({ nullable: true })
  versaoscb: string;

  @Column({ nullable: true })
  fonteinv: string;

  @Column({ nullable: true })
  dtrecebim: string;

  @Column({ nullable: true })
  atestado: string;

  @Column({ nullable: true })
  dtrecoriga: string;

  @Column({ nullable: true, name: 'opor_do' })
  opor_do: string;

  @Column({ nullable: true })
  causamat: string;

  @Column({ nullable: true })
  escmaeagr1: string;

  @Column({ nullable: true })
  escfalagr1: string;

  @Column({ nullable: true })
  stdoepidem: string;

  @Column({ nullable: true })
  stdonova: string;

  @Column({ nullable: true })
  difdata: string;

  @Column({ nullable: true })
  nudiasobco: string;

  @Column({ nullable: true })
  dtcadinv: string;

  @Column({ nullable: true })
  tpobitocor: string;

  @Column({ nullable: true })
  dtconinv: string;

  @Column({ nullable: true })
  fontes: string;

  @Column({ nullable: true })
  tpresginfo: string;

  @Column({ nullable: true })
  tpnivelinv: string;

  @Column({ nullable: true })
  dtcadinf: string;

  @Column({ nullable: true })
  morteparto: string;

  @Column({ nullable: true })
  dtconcaso: string;

  @Column({ nullable: true })
  altcausa: string;

  @Column({ nullable: true, name: 'causabas_o' })
  causabas_o: string;

  @Column({ nullable: true })
  tppos: string;

  @Column({ nullable: true, name: 'tp_altera' })
  tp_altera: string;

  @Column({ nullable: true, name: 'cb_alt' })
  cb_alt: string;

  @Column()
  ano: number;

  @Column({ nullable: true })
  nudiasinf: string;

  @Column({ nullable: true })
  fontesinf: string;

  @Column({ nullable: true })
  nudiasobin: string;

  @Column({ nullable: true })
  estabdescr: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
