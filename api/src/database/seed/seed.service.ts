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
import { BaseDados } from '../../bases/entities/base-dados.entity';
import { ColunaBase } from '../../bases/entities/coluna-base.entity';
import { Sinasc } from '../../sinasc/entities/sinasc.entity';
import { Sim } from '../../sim/entities/sim.entity';
import { TemaIndicador } from '../../tema-indicador/entities/tema-indicador.entity';
import { Indicador } from '../../indicadores/entities/indicador.entity';

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

const SINASC_COLUNAS = [
  { nome: 'contador', rotulo: 'Contador', tipo: 'number' },
  { nome: 'ano', rotulo: 'Ano', tipo: 'number' },
  { nome: 'locnasc', rotulo: 'Local de Nascimento', tipo: 'string' },
  { nome: 'codmunnasc', rotulo: 'Código Município Nascimento', tipo: 'string' },
  { nome: 'idademae', rotulo: 'Idade da Mãe', tipo: 'number' },
  { nome: 'estcivmae', rotulo: 'Estado Civil da Mãe', tipo: 'string' },
  { nome: 'escmae', rotulo: 'Escolaridade da Mãe', tipo: 'string' },
  { nome: 'codocupmae', rotulo: 'Ocupação da Mãe', tipo: 'string' },
  { nome: 'qtdfilvivo', rotulo: 'Qtd Filhos Vivos', tipo: 'number' },
  { nome: 'qtdfilmort', rotulo: 'Qtd Filhos Mortos', tipo: 'number' },
  { nome: 'codmunres', rotulo: 'Código Município Residência', tipo: 'string' },
  { nome: 'gestacao', rotulo: 'Semanas de Gestação (grupo)', tipo: 'string' },
  { nome: 'gravidez', rotulo: 'Tipo de Gravidez', tipo: 'string' },
  { nome: 'parto', rotulo: 'Tipo de Parto', tipo: 'string' },
  { nome: 'consultas', rotulo: 'Consultas Pré-natal', tipo: 'string' },
  { nome: 'dtnasc', rotulo: 'Data de Nascimento', tipo: 'date' },
  { nome: 'sexo', rotulo: 'Sexo', tipo: 'string' },
  { nome: 'apgar1', rotulo: 'APGAR 1º Minuto', tipo: 'number' },
  { nome: 'apgar5', rotulo: 'APGAR 5º Minuto', tipo: 'number' },
  { nome: 'racacor', rotulo: 'Raça/Cor', tipo: 'string' },
  { nome: 'peso', rotulo: 'Peso ao Nascer (g)', tipo: 'number' },
  { nome: 'codestab', rotulo: 'Código do Estabelecimento', tipo: 'string' },
  { nome: 'naturalmae', rotulo: 'Naturalidade da Mãe', tipo: 'string' },
  { nome: 'codmunnatu', rotulo: 'Código Município Naturalidade Mãe', tipo: 'string' },
  { nome: 'tpnascassi', rotulo: 'Tipo de Nascimento Assistido', tipo: 'string' },
  { nome: 'consprenat', rotulo: 'Número de Consultas Pré-natal', tipo: 'number' },
  { nome: 'mesprenat', rotulo: 'Mês de Início do Pré-natal', tipo: 'number' },
  { nome: 'idanomal', rotulo: 'Anomalia Congênita', tipo: 'string' },
  { nome: 'semagestac', rotulo: 'Semanas de Gestação', tipo: 'string' },
];

const SIM_COLUNAS = [
  { nome: 'contador', rotulo: 'Contador', tipo: 'number' },
  { nome: 'origem', rotulo: 'Origem', tipo: 'string' },
  { nome: 'tipobito', rotulo: 'Tipo de Óbito', tipo: 'string' },
  { nome: 'dtobito', rotulo: 'Data do Óbito', tipo: 'date' },
  { nome: 'horaobito', rotulo: 'Hora do Óbito', tipo: 'string' },
  { nome: 'natural', rotulo: 'Naturalidade', tipo: 'string' },
  { nome: 'codmunnatu', rotulo: 'Código Município Naturalidade', tipo: 'string' },
  { nome: 'dtnasc', rotulo: 'Data de Nascimento', tipo: 'date' },
  { nome: 'idade', rotulo: 'Idade', tipo: 'string' },
  { nome: 'sexo', rotulo: 'Sexo', tipo: 'string' },
  { nome: 'racacor', rotulo: 'Raça/Cor', tipo: 'string' },
  { nome: 'estciv', rotulo: 'Estado Civil', tipo: 'string' },
  { nome: 'esc', rotulo: 'Escolaridade', tipo: 'string' },
  { nome: 'esc2010', rotulo: 'Escolaridade 2010', tipo: 'string' },
  { nome: 'seriescfal', rotulo: 'Série Escolar do Falecido', tipo: 'string' },
  { nome: 'ocup', rotulo: 'Ocupação', tipo: 'string' },
  { nome: 'codmunres', rotulo: 'Código Município Residência', tipo: 'string' },
  { nome: 'lococor', rotulo: 'Local de Ocorrência', tipo: 'string' },
  { nome: 'codestab', rotulo: 'Código do Estabelecimento', tipo: 'string' },
  { nome: 'codmunocor', rotulo: 'Código Município Ocorrência', tipo: 'string' },
  { nome: 'idademae', rotulo: 'Idade da Mãe', tipo: 'string' },
  { nome: 'escmae', rotulo: 'Escolaridade da Mãe', tipo: 'string' },
  { nome: 'escmae2010', rotulo: 'Escolaridade da Mãe 2010', tipo: 'string' },
  { nome: 'seriescmae', rotulo: 'Série Escolar da Mãe', tipo: 'string' },
  { nome: 'ocupmae', rotulo: 'Ocupação da Mãe', tipo: 'string' },
  { nome: 'qtdfilvivo', rotulo: 'Qtd Filhos Vivos', tipo: 'string' },
  { nome: 'qtdfilmort', rotulo: 'Qtd Filhos Mortos', tipo: 'string' },
  { nome: 'gravidez', rotulo: 'Tipo de Gravidez', tipo: 'string' },
  { nome: 'semagestac', rotulo: 'Semanas de Gestação', tipo: 'string' },
  { nome: 'gestacao', rotulo: 'Gestação (grupo)', tipo: 'string' },
  { nome: 'parto', rotulo: 'Tipo de Parto', tipo: 'string' },
  { nome: 'obitoparto', rotulo: 'Óbito em Relação ao Parto', tipo: 'string' },
  { nome: 'peso', rotulo: 'Peso ao Nascer (g)', tipo: 'number' },
  { nome: 'tpmorteoco', rotulo: 'Tipo de Morte/Ocorrência', tipo: 'string' },
  { nome: 'obitograv', rotulo: 'Óbito na Gravidez', tipo: 'string' },
  { nome: 'obitopuerp', rotulo: 'Óbito no Puerpério', tipo: 'string' },
  { nome: 'assistmed', rotulo: 'Assistência Médica', tipo: 'string' },
  { nome: 'exame', rotulo: 'Exame Complementar', tipo: 'string' },
  { nome: 'cirurgia', rotulo: 'Cirurgia', tipo: 'string' },
  { nome: 'necropsia', rotulo: 'Necropsia', tipo: 'string' },
  { nome: 'linhaa', rotulo: 'Linha A (CID)', tipo: 'string' },
  { nome: 'linhab', rotulo: 'Linha B (CID)', tipo: 'string' },
  { nome: 'linhac', rotulo: 'Linha C (CID)', tipo: 'string' },
  { nome: 'linhad', rotulo: 'Linha D (CID)', tipo: 'string' },
  { nome: 'linhaii', rotulo: 'Linha II (CID)', tipo: 'string' },
  { nome: 'causabas', rotulo: 'Causa Básica (CID)', tipo: 'string' },
  { nome: 'cb_pre', rotulo: 'Causa Básica Prévia', tipo: 'string' },
  { nome: 'comunsvoim', rotulo: 'Comuns VOIM', tipo: 'string' },
  { nome: 'dtatestado', rotulo: 'Data do Atestado', tipo: 'date' },
  { nome: 'circobito', rotulo: 'Circunstância do Óbito', tipo: 'string' },
  { nome: 'acidtrab', rotulo: 'Acidente de Trabalho', tipo: 'string' },
  { nome: 'fonte', rotulo: 'Fonte', tipo: 'string' },
  { nome: 'numerolote', rotulo: 'Número do Lote', tipo: 'string' },
  { nome: 'dtinvestig', rotulo: 'Data de Investigação', tipo: 'date' },
  { nome: 'dtcadastro', rotulo: 'Data de Cadastro', tipo: 'date' },
  { nome: 'atestante', rotulo: 'Atestante', tipo: 'string' },
  { nome: 'stcodifica', rotulo: 'Status de Codificação', tipo: 'string' },
  { nome: 'codificado', rotulo: 'Codificado', tipo: 'string' },
  { nome: 'versaosist', rotulo: 'Versão do Sistema', tipo: 'string' },
  { nome: 'versaoscb', rotulo: 'Versão SCB', tipo: 'string' },
  { nome: 'fonteinv', rotulo: 'Fonte de Investigação', tipo: 'string' },
  { nome: 'dtrecebim', rotulo: 'Data de Recebimento', tipo: 'date' },
  { nome: 'atestado', rotulo: 'Atestado', tipo: 'string' },
  { nome: 'dtrecoriga', rotulo: 'Data de Recebimento Original', tipo: 'date' },
  { nome: 'opor_do', rotulo: 'Oportunidade DO', tipo: 'string' },
  { nome: 'causamat', rotulo: 'Causa Materna', tipo: 'string' },
  { nome: 'escmaeagr1', rotulo: 'Escolaridade Mãe Agregada', tipo: 'string' },
  { nome: 'escfalagr1', rotulo: 'Escolaridade Falecido Agregada', tipo: 'string' },
  { nome: 'stdoepidem', rotulo: 'Status DO Epidemiológico', tipo: 'string' },
  { nome: 'stdonova', rotulo: 'Status DO Nova', tipo: 'string' },
  { nome: 'difdata', rotulo: 'Diferença de Datas', tipo: 'string' },
  { nome: 'nudiasobco', rotulo: 'Número de Dias Óbito/Cadastro', tipo: 'string' },
  { nome: 'dtcadinv', rotulo: 'Data de Cadastro na Investigação', tipo: 'date' },
  { nome: 'tpobitocor', rotulo: 'Tipo Óbito/Ocorrência', tipo: 'string' },
  { nome: 'dtconinv', rotulo: 'Data de Conclusão da Investigação', tipo: 'date' },
  { nome: 'fontes', rotulo: 'Fontes', tipo: 'string' },
  { nome: 'tpresginfo', rotulo: 'Tipo de Resgate de Informação', tipo: 'string' },
  { nome: 'tpnivelinv', rotulo: 'Tipo de Nível de Investigação', tipo: 'string' },
  { nome: 'dtcadinf', rotulo: 'Data de Cadastro da Informação', tipo: 'date' },
  { nome: 'morteparto', rotulo: 'Morte no Parto', tipo: 'string' },
  { nome: 'dtconcaso', rotulo: 'Data de Conclusão do Caso', tipo: 'date' },
  { nome: 'altcausa', rotulo: 'Alteração de Causa', tipo: 'string' },
  { nome: 'causabas_o', rotulo: 'Causa Básica Original', tipo: 'string' },
  { nome: 'tppos', rotulo: 'Tipo de Pós', tipo: 'string' },
  { nome: 'tp_altera', rotulo: 'Tipo de Alteração', tipo: 'string' },
  { nome: 'cb_alt', rotulo: 'Causa Básica Alterada', tipo: 'string' },
  { nome: 'ano', rotulo: 'Ano', tipo: 'number' },
  { nome: 'nudiasinf', rotulo: 'Número de Dias da Informação', tipo: 'string' },
  { nome: 'fontesinf', rotulo: 'Fontes da Informação', tipo: 'string' },
  { nome: 'nudiasobin', rotulo: 'Número de Dias Óbito/Informação', tipo: 'string' },
  { nome: 'estabdescr', rotulo: 'Descrição do Estabelecimento', tipo: 'string' },
];

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Estado)
    private readonly estadosRepository: Repository<Estado>,
    @InjectRepository(Municipio)
    private readonly municipiosRepository: Repository<Municipio>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(BaseDados)
    private readonly baseDadosRepository: Repository<BaseDados>,
    @InjectRepository(ColunaBase)
    private readonly colunaBaseRepository: Repository<ColunaBase>,
    @InjectRepository(Sinasc)
    private readonly sinascRepository: Repository<Sinasc>,
    @InjectRepository(Sim)
    private readonly simRepository: Repository<Sim>,
    @InjectRepository(TemaIndicador)
    private readonly temaIndicadorRepository: Repository<TemaIndicador>,
    @InjectRepository(Indicador)
    private readonly indicadorRepository: Repository<Indicador>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedUsers();
    await this.seedMunicipios();
    await this.seedBasesDados();
    await this.seedColunasBases();
    await this.seedSinasc();
    await this.seedSim();
    await this.seedTemasIndicadores();
    await this.seedIndicadores();
  }

  private resolveJsonPath(filename: string): string | null {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'database',
      'seed',
      'data',
      filename,
    );
    if (fs.existsSync(srcPath)) return srcPath;

    const distPath = path.join(__dirname, 'data', filename);
    if (fs.existsSync(distPath)) return distPath;

    return null;
  }

  private async seedUsers(): Promise<void> {
    const filePath = this.resolveJsonPath('users.json');
    if (!filePath) return;
    const usersData: UserSeedData[] = JSON.parse(
      fs.readFileSync(filePath, 'utf-8'),
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

    const estadosPath = this.resolveJsonPath('estados.json');
    const municipiosPath = this.resolveJsonPath('municipios-rn.json');
    if (!estadosPath || !municipiosPath) return;

    const estadosData: EstadoSeedData[] = JSON.parse(
      fs.readFileSync(estadosPath, 'utf-8'),
    );

    const municipiosData: MunicipioSeedData[] = JSON.parse(
      fs.readFileSync(municipiosPath, 'utf-8'),
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

  private async seedBasesDados(): Promise<void> {
    const filePath = this.resolveJsonPath('bases-dados.json');
    if (!filePath) return;

    const bases: { sigla: string; nome: string; descricao: string }[] =
      JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    for (const base of bases) {
      const existing = await this.baseDadosRepository.findOne({
        where: { sigla: base.sigla },
      });
      if (!existing) {
        await this.baseDadosRepository.save(
          this.baseDadosRepository.create(base),
        );
      }
    }
  }

  private async seedColunasBases(): Promise<void> {
    const sinasc = await this.baseDadosRepository.findOne({
      where: { sigla: 'SINASC' },
    });
    const sim = await this.baseDadosRepository.findOne({
      where: { sigla: 'SIM' },
    });

    if (sinasc) {
      const existingCount = await this.colunaBaseRepository.count({
        where: { base: { id: sinasc.id } },
      });
      if (existingCount === 0) {
        const colunas = SINASC_COLUNAS.map((c) =>
          this.colunaBaseRepository.create({ ...c, base: sinasc }),
        );
        await this.colunaBaseRepository.save(colunas);
      }
    }

    if (sim) {
      const existingCount = await this.colunaBaseRepository.count({
        where: { base: { id: sim.id } },
      });
      if (existingCount === 0) {
        const colunas = SIM_COLUNAS.map((c) =>
          this.colunaBaseRepository.create({ ...c, base: sim }),
        );
        await this.colunaBaseRepository.save(colunas);
      }
    }
  }

  private async seedSinasc(): Promise<void> {
    for (let year = 2020; year <= 2024; year++) {
      const filePath = this.resolveJsonPath(`sinasc-${year}.json`);
      if (!filePath) continue;

      const existingCount = await this.sinascRepository.count({
        where: { ano: year },
      });
      if (existingCount > 0) continue;

      const raw: unknown = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      let records: Record<string, unknown>[];

      if (Array.isArray(raw)) {
        records = raw as Record<string, unknown>[];
      } else if (
        raw &&
        typeof raw === 'object' &&
        'Base_nascidos_vivos' in raw &&
        Array.isArray((raw as Record<string, unknown>)['Base_nascidos_vivos'])
      ) {
        records = (raw as Record<string, unknown[]>)[
          'Base_nascidos_vivos'
        ] as Record<string, unknown>[];
      } else if (raw && typeof raw === 'object') {
        const firstArray = Object.values(raw as object).find((v) =>
          Array.isArray(v),
        );
        records = (firstArray as Record<string, unknown>[]) ?? [];
      } else {
        records = [];
      }

      const seen = new Set<string>();
      const unique = records.filter((item) => {
        const key = `${item.contador}-${item.ano ?? year}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const CHUNK = 1000;
      for (let i = 0; i < unique.length; i += CHUNK) {
        const chunk = unique.slice(i, i + CHUNK);
        const entities = chunk.map((item) => ({
          contador: Number(item.contador),
          ano: Number(item.ano ?? year),
          locnasc: (item.LOCNASC as string) ?? null,
          codmunnasc: (item.CODMUNNASC as string) ?? null,
          idademae: item.IDADEMAE != null ? Number(item.IDADEMAE) : null,
          estcivmae: (item.ESTCIVMAE as string) ?? null,
          escmae: (item.ESCMAE as string) ?? null,
          codocupmae: (item.CODOCUPMAE as string) ?? null,
          qtdfilvivo:
            item.QTDFILVIVO != null ? Number(item.QTDFILVIVO) : null,
          qtdfilmort:
            item.QTDFILMORT != null ? Number(item.QTDFILMORT) : null,
          codmunres: (item.CODMUNRES as string) ?? null,
          gestacao: (item.GESTACAO as string) ?? null,
          gravidez: (item.GRAVIDEZ as string) ?? null,
          parto: (item.PARTO as string) ?? null,
          consultas: (item.CONSULTAS as string) ?? null,
          dtnasc: (item.DTNASC as string) ?? null,
          sexo: (item.SEXO as string) ?? null,
          apgar1: item.APGAR1 != null ? Number(item.APGAR1) : null,
          apgar5: item.APGAR5 != null ? Number(item.APGAR5) : null,
          racacor: (item.RACACOR as string) ?? null,
          peso: item.PESO != null ? Number(item.PESO) : null,
          codestab: (item.CODESTAB as string) ?? null,
          naturalmae: (item.NATURALMAE as string) ?? null,
          codmunnatu: (item.CODMUNNATU as string) ?? null,
          tpnascassi: (item.TPNASCASSI as string) ?? null,
          consprenat:
            item.CONSPRENAT != null ? Number(item.CONSPRENAT) : null,
          mesprenat: item.MESPRENAT != null ? Number(item.MESPRENAT) : null,
          idanomal: (item.IDANOMAL as string) ?? null,
          semagestac: (item.SEMAGESTAC as string) ?? null,
        }));
        await this.sinascRepository.insert(entities as any);
      }
    }
  }

  private async seedSim(): Promise<void> {
    for (let year = 2020; year <= 2024; year++) {
      const filePath = this.resolveJsonPath(`sim-${year}.json`);
      if (!filePath) continue;

      const existingCount = await this.simRepository.count({
        where: { ano: year },
      });
      if (existingCount > 0) continue;

      const raw: unknown = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      let records: Record<string, unknown>[];

      if (Array.isArray(raw)) {
        records = raw as Record<string, unknown>[];
      } else if (
        raw &&
        typeof raw === 'object' &&
        'Base_obitos' in raw &&
        Array.isArray((raw as Record<string, unknown>)['Base_obitos'])
      ) {
        records = (raw as Record<string, unknown[]>)[
          'Base_obitos'
        ] as Record<string, unknown>[];
      } else if (raw && typeof raw === 'object') {
        const firstArray = Object.values(raw as object).find((v) =>
          Array.isArray(v),
        );
        records = (firstArray as Record<string, unknown>[]) ?? [];
      } else {
        records = [];
      }

      const seen = new Set<string>();
      const unique = records.filter((item) => {
        const key = `${item.contador}-${item.ano ?? year}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const CHUNK = 1000;
      for (let i = 0; i < unique.length; i += CHUNK) {
        const chunk = unique.slice(i, i + CHUNK);
        const entities = chunk.map((item) => ({
          contador: Number(item.contador),
          origem: (item.origem as string) ?? null,
          tipobito: (item.tipobito as string) ?? null,
          dtobito: (item.dtobito as string) ?? null,
          horaobito: (item.horaobito as string) ?? null,
          natural: (item.natural as string) ?? null,
          codmunnatu: (item.codmunnatu as string) ?? null,
          dtnasc: (item.dtnasc as string) ?? null,
          idade: (item.idade as string) ?? null,
          sexo: (item.sexo as string) ?? null,
          racacor: (item.racacor as string) ?? null,
          estciv: (item.estciv as string) ?? null,
          esc: (item.esc as string) ?? null,
          esc2010: (item.esc2010 as string) ?? null,
          seriescfal: (item.seriescfal as string) ?? null,
          ocup: (item.ocup as string) ?? null,
          codmunres: (item.codmunres as string) ?? null,
          lococor: (item.lococor as string) ?? null,
          codestab: (item.codestab as string) ?? null,
          codmunocor: (item.codmunocor as string) ?? null,
          idademae: (item.idademae as string) ?? null,
          escmae: (item.escmae as string) ?? null,
          escmae2010: (item.escmae2010 as string) ?? null,
          seriescmae: (item.seriescmae as string) ?? null,
          ocupmae: (item.ocupmae as string) ?? null,
          qtdfilvivo: (item.qtdfilvivo as string) ?? null,
          qtdfilmort: (item.qtdfilmort as string) ?? null,
          gravidez: (item.gravidez as string) ?? null,
          semagestac: (item.semagestac as string) ?? null,
          gestacao: (item.gestacao as string) ?? null,
          parto: (item.parto as string) ?? null,
          obitoparto: (item.obitoparto as string) ?? null,
          peso: item.peso != null ? Number(item.peso) : null,
          tpmorteoco: (item.tpmorteoco as string) ?? null,
          obitograv: (item.obitograv as string) ?? null,
          obitopuerp: (item.obitopuerp as string) ?? null,
          assistmed: (item.assistmed as string) ?? null,
          exame: (item.exame as string) ?? null,
          cirurgia: (item.cirurgia as string) ?? null,
          necropsia: (item.necropsia as string) ?? null,
          linhaa: (item.linhaa as string) ?? null,
          linhab: (item.linhab as string) ?? null,
          linhac: (item.linhac as string) ?? null,
          linhad: (item.linhad as string) ?? null,
          linhaii: (item.linhaii as string) ?? null,
          causabas: (item.causabas as string) ?? null,
          cb_pre: (item.cb_pre as string) ?? null,
          comunsvoim: (item.comunsvoim as string) ?? null,
          dtatestado: (item.dtatestado as string) ?? null,
          circobito: (item.circobito as string) ?? null,
          acidtrab: (item.acidtrab as string) ?? null,
          fonte: (item.fonte as string) ?? null,
          numerolote: (item.numerolote as string) ?? null,
          dtinvestig: (item.dtinvestig as string) ?? null,
          dtcadastro: (item.dtcadastro as string) ?? null,
          atestante: (item.atestante as string) ?? null,
          stcodifica: (item.stcodifica as string) ?? null,
          codificado: (item.codificado as string) ?? null,
          versaosist: (item.versaosist as string) ?? null,
          versaoscb: (item.versaoscb as string) ?? null,
          fonteinv: (item.fonteinv as string) ?? null,
          dtrecebim: (item.dtrecebim as string) ?? null,
          atestado: (item.atestado as string) ?? null,
          dtrecoriga: (item.dtrecoriga as string) ?? null,
          opor_do: (item.opor_do as string) ?? null,
          causamat: (item.causamat as string) ?? null,
          escmaeagr1: (item.escmaeagr1 as string) ?? null,
          escfalagr1: (item.escfalagr1 as string) ?? null,
          stdoepidem: (item.stdoepidem as string) ?? null,
          stdonova: (item.stdonova as string) ?? null,
          difdata: (item.difdata as string) ?? null,
          nudiasobco: (item.nudiasobco as string) ?? null,
          dtcadinv: (item.dtcadinv as string) ?? null,
          tpobitocor: (item.tpobitocor as string) ?? null,
          dtconinv: (item.dtconinv as string) ?? null,
          fontes: (item.fontes as string) ?? null,
          tpresginfo: (item.tpresginfo as string) ?? null,
          tpnivelinv: (item.tpnivelinv as string) ?? null,
          dtcadinf: (item.dtcadinf as string) ?? null,
          morteparto: (item.morteparto as string) ?? null,
          dtconcaso: (item.dtconcaso as string) ?? null,
          altcausa: (item.altcausa as string) ?? null,
          causabas_o: (item.causabas_o as string) ?? null,
          tppos: (item.tppos as string) ?? null,
          tp_altera: (item.tp_altera as string) ?? null,
          cb_alt: (item.cb_alt as string) ?? null,
          ano: Number(item.ano ?? year),
          nudiasinf: (item.nudiasinf as string) ?? null,
          fontesinf: (item.fontesinf as string) ?? null,
          nudiasobin: (item.nudiasobin as string) ?? null,
          estabdescr: (item.estabdescr as string) ?? null,
        }));
        await this.simRepository.insert(entities as any);
      }
    }
  }

  private async seedTemasIndicadores(): Promise<void> {
    const filePath = this.resolveJsonPath('temas_dados.json');
    if (!filePath) return;

    const count = await this.temaIndicadorRepository.count();
    if (count > 0) return;

    const temas: { id: number; nome: string }[] = JSON.parse(
      fs.readFileSync(filePath, 'utf-8'),
    );

    await this.temaIndicadorRepository.save(temas);
  }

  private async seedIndicadores(): Promise<void> {
    const filePath = this.resolveJsonPath('indicadores_dados.json');
    if (!filePath) return;

    const count = await this.indicadorRepository.count();
    if (count > 0) return;

    const items: {
      id: number;
      previsto_ods: boolean;
      meta_ods: string;
      numero_ods: number;
      nome: string;
      descricao: string;
      tema_id: number;
      fonte: string;
      direcaoInterpretativa: string;
      status: string;
    }[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    for (const item of items) {
      const tema = await this.temaIndicadorRepository.findOne({
        where: { id: item.tema_id },
      });
      if (!tema) continue;

      const indicador = this.indicadorRepository.create({
        previstoOds: item.previsto_ods,
        metaOds: item.meta_ods,
        numeroOds: item.numero_ods,
        nome: item.nome,
        descricao: item.descricao,
        tema,
        fonte: item.fonte,
        direcaoInterpretativa: item.direcaoInterpretativa,
        status: item.status,
      });

      await this.indicadorRepository.save(indicador);
    }
  }
}
