# Monitor de Indicadores Municipais

Sistema web para visualização de indicadores dos municípios do Rio Grande do Norte, com mapa interativo público e painel administrativo.

## Tecnologias

**API (backend)**

- NestJS com TypeScript
- TypeORM com SQLite (em memória)
- JWT para autenticação
- Swagger/OpenAPI para documentação dos endpoints
- bcryptjs para hash de senhas
- class-validator / class-transformer para validação

**Frontend**

- React com TypeScript
- Vite
- MapLibre para o mapa interativo

## Estrutura do projeto

O projeto está organizado em duas aplicações principais:

```txt
api/   API REST desenvolvida em NestJS
app/   Interface web desenvolvida em React
```

A API concentra as regras de negócio, autenticação, persistência em banco relacional com TypeORM, documentação Swagger e processamento dos indicadores municipais. O frontend consome os endpoints da API e disponibiliza as telas de consulta, autenticação, administração, mapa e ranking.

### Requisitos funcionais atendidos

O sistema implementa os seguintes requisitos funcionais:

| Nº | Requisito funcional | Descrição |
|---|---|---|
| 1 | Autenticação de usuários | Permite login com e-mail e senha. |
| 2 | Autenticação com token JWT | Após o login, a API retorna um token JWT para acesso às rotas protegidas. |
| 3 | Controle de perfis de usuário | O sistema possui perfis como `ADMIN` e `GESTOR_PUBLICO`. |
| 4 | CRUD de usuários | Permite cadastrar, listar, consultar, editar e remover usuários. |
| 5 | CRUD de estados | Permite cadastrar, listar, consultar, editar e remover estados. |
| 6 | CRUD de municípios | Permite cadastrar, listar, consultar, editar e remover municípios. |
| 7 | CRUD de temas de indicadores | Permite gerenciar os temas utilizados para classificar indicadores. |
| 8 | CRUD de indicadores | Permite cadastrar, listar, consultar, editar e remover indicadores. |
| 9 | CRUD de ODS | Permite cadastrar, listar, consultar, editar e remover Objetivos de Desenvolvimento Sustentável vinculáveis aos indicadores. |
| 10 | Consulta de bases de dados | Permite consultar as bases disponíveis, como SINASC e SIM. |
| 11 | Consulta de dados SINASC | Permite consultar registros, contagem e resumos da base SINASC. |
| 12 | Consulta de dados SIM | Permite consultar registros, contagem e resumos da base SIM. |
| 13 | Processamento de indicadores calculados | Permite calcular indicadores municipais por ano e município a partir das bases de origem. |
| 14 | Consulta de indicadores calculados | Permite consultar os valores calculados dos indicadores com filtros. |
| 15 | Processamento de rankings | Permite gerar rankings municipais a partir dos indicadores calculados. |
| 16 | Consulta de rankings | Permite consultar a posição dos municípios no ranking por indicador e ano. |
| 17 | Visualização em mapa | Permite visualizar indicadores municipais em interface de mapa. |
| 18 | Área administrativa | Permite acessar funcionalidades de gestão por usuários autenticados. |
| 19 | Documentação da API | Disponibiliza documentação dos endpoints por meio do Swagger/OpenAPI. |

### Entidades com CRUD completo

As seguintes entidades possuem operações completas de CRUD na API:

| Entidade | Operações disponíveis |
|---|---|
| `User` | Criar, listar, consultar por id, atualizar e remover |
| `Estado` | Criar, listar, consultar por id, atualizar e remover |
| `Municipio` | Criar, listar, consultar por id, atualizar e remover |
| `TemaIndicador` | Criar, listar, consultar por id, atualizar e remover |
| `Indicador` | Criar, listar, consultar por id, atualizar e remover |
| `Ods` | Criar, listar, consultar por id, atualizar e remover |

Além dessas, o sistema possui entidades voltadas à consulta, processamento e armazenamento de dados derivados, como `Sinasc`, `Sim`, `IndicadorCalculado`, `Ranking`, `BaseDados` e `GestorMunicipal`.

### Entidades mapeadas

O backend utiliza TypeORM para mapeamento objeto-relacional. Entre as entidades mapeadas estão:

| Entidade | Finalidade |
|---|---|
| `User` | Representa os usuários do sistema. |
| `Role` | Representa os perfis de acesso. |
| `GestorMunicipal` | Representa o vínculo entre usuário gestor e município. |
| `Estado` | Representa os estados cadastrados. |
| `Municipio` | Representa os municípios cadastrados. |
| `BaseDados` | Representa bases como SINASC e SIM. |
| `Sinasc` | Representa registros da base de nascidos vivos. |
| `Sim` | Representa registros da base de mortalidade. |
| `TemaIndicador` | Representa categorias temáticas dos indicadores. |
| `Indicador` | Representa os indicadores municipais cadastrados. |
| `IndicadorCalculado` | Armazena os valores calculados dos indicadores por município e ano. |
| `Ranking` | Armazena a posição dos municípios no ranking por indicador e ano. |
| `Ods` | Representa os Objetivos de Desenvolvimento Sustentável vinculáveis aos indicadores. |

### Relacionamentos implementados

O sistema possui os principais tipos de relacionamento exigidos no projeto.

#### Relacionamentos um-para-muitos e muitos-para-um

| Relacionamento | Descrição |
|---|---|
| `Estado` 1:N `Municipio` | Um estado possui vários municípios. |
| `TemaIndicador` 1:N `Indicador` | Um tema pode agrupar vários indicadores. |
| `Ods` 1:N `Indicador` | Um ODS pode estar vinculado a vários indicadores. |
| `Indicador` 1:N `IndicadorCalculado` | Um indicador pode possuir vários valores calculados. |
| `Indicador` 1:N `Ranking` | Um indicador pode possuir vários registros de ranking. |
| `Role` 1:N `User` | Um perfil pode estar associado a vários usuários. |

#### Relacionamento muitos-para-muitos

| Relacionamento | Descrição |
|---|---|
| `Indicador` N:N `BaseDados` | Um indicador pode utilizar uma ou mais bases de dados, e uma base pode ser utilizada por vários indicadores. |

Esse relacionamento é materializado pela tabela intermediária `indicador_base_dados`.

#### Relacionamento um-para-um

| Relacionamento | Descrição |
|---|---|
| `User` 1:1 `GestorMunicipal` | Um usuário gestor público possui um único vínculo de gestão municipal. |
| `GestorMunicipal` 1:1 `Municipio` | Cada vínculo de gestor municipal está associado a um único município. |

### Consultas personalizadas

O sistema também possui consultas personalizadas para processamento e análise dos indicadores, incluindo:

- agregações sobre as bases SINASC e SIM;
- consultas com filtros por ano, município e indicador;
- cálculo de indicadores municipais por município e ano;
- cálculo percentual de indicadores;
- geração de ranking com ordenação conforme a direção interpretativa do indicador;
- uso de consultas SQL customizadas e funções como `RANK() OVER`, `GROUP BY`, `COUNT`, `SUM` e expressões condicionais.

Essas consultas são utilizadas principalmente nos módulos de indicadores calculados, rankings e bases de dados.

## Pré-requisitos

- Node.js >= 18

## Instalação e execução

### API

```bash
cd api
npm install
npm run start
```

A API estará disponível em `http://localhost:3000`.

### Frontend

```bash
cd app
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

## Swagger

Com a API em execução, acesse:

```
http://localhost:3000/api/docs
```

## Build

### Build da API

```bash
cd api
npm run build
```

O resultado é gerado em `api/dist/`. Para executar o build de produção:

```bash
npm run start:prod
```

### Build do frontend

```bash
cd app
npm run build
```

O resultado é gerado em `app/dist/`.

## Variáveis de ambiente

Copie os arquivos de exemplo antes de rodar:

```bash
# API
cp api/.env.example api/.env

# Frontend
cp app/.env.example app/.env
```

Os arquivos `.env.example` documentam todas as variáveis necessárias para cada ambiente.

## Banco de dados

A API utiliza SQLite em memória. Isso significa que os dados são perdidos ao reiniciar a aplicação. Ao iniciar, o módulo seed popula automaticamente as tabelas com os dados de referência (estados, municípios, temas, indicadores, usuário admin).

Esse modelo foi adotado para simplificar o setup e facilitar a demonstração do sistema.

## Módulo Seed

O seed é executado automaticamente na inicialização da API. Ele lê arquivos JSON da pasta `api/src/database/seed/data/` e insere os dados nas tabelas correspondentes.

Os arquivos pequenos (estados, municípios, temas, indicadores, usuários) estão versionados no repositório.

Os arquivos grandes das bases SINASC e SIM **não estão versionados** — veja a seção abaixo.

## Arquivos de dados grandes (SINASC / SIM)

Os arquivos JSON com os microdados do SINASC e do SIM são grandes demais para serem versionados no repositório.

**Download:**

[https://drive.google.com/drive/u/1/folders/1dSj6dRT-cyYL6biglXo38vLBeVKu8zmq?usp=sharing](https://drive.google.com/drive/u/1/folders/1dSj6dRT-cyYL6biglXo38vLBeVKu8zmq?usp=sharing)

Após baixar, coloque os arquivos em:

```
api/src/database/seed/data/
```

Arquivos esperados (formato único por base):

```
sinasc-2020-2024.json
mortalidade-2020-2024.json
```

A API pode iniciar sem esses arquivos. Funcionalidades que dependem dos microdados (processamento de indicadores calculados e rankings) terão dados vazios até que os arquivos sejam adicionados.

## Perfis de usuário

| Perfil | Descrição |
|---|---|
| `ADMIN` | Acesso total ao painel administrativo |
| `GESTOR_PUBLICO` | Acesso restrito aos recursos do município vinculado |

O usuário admin padrão é criado pelo seed. Consulte o arquivo `api/src/database/seed/data/users.json` para as credenciais de demonstração.


## Observação sobre o processamento inicial dos indicadores

Para que o ambiente público do sistema funcione corretamente, é necessário realizar o processamento inicial dos indicadores após iniciar a aplicação.

Esse processamento deve ser feito por um usuário com perfil de administrador.

Fluxo recomendado:

1. Iniciar a API.
2. Iniciar o frontend.
3. Acessar o sistema com usuário administrador.
4. Processar cada um dos indicadores cadastrados.
5. Acessar o ambiente público do mapa e do ranking quando logado com Gestor Público.

Enquanto os indicadores não forem processados, as telas de mapa e ranking não apresentarão dados.

Isso ocorre porque os dados exibidos nessas telas são derivados da tabela de indicadores calculados e da tabela de rankings, que são preenchidas a partir do processamento dos indicadores existentes.