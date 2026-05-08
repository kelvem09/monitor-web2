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
