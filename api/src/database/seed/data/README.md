# Seed Data

Esta pasta armazena os arquivos JSON utilizados pelo módulo seed para popular o banco de dados na inicialização da API.

## Arquivos versionados (pequenos)

Os arquivos abaixo estão no repositório e são carregados automaticamente:

| Arquivo | Descrição |
|---|---|
| `estados.json` | Estados brasileiros |
| `municipios-rn.json` | Municípios do Rio Grande do Norte |
| `temas_dados.json` | Temas dos indicadores |
| `indicadores_dados.json` | Indicadores cadastrados |
| `bases-dados.json` | Bases de dados de saúde |
| `users.json` | Usuário(s) padrão para demonstração |

## Arquivos não versionados (grandes)

Os microdados do SINASC e do SIM são grandes demais para serem versionados. Eles devem ser baixados separadamente e colocados nesta pasta.

**Download:**

[https://drive.google.com/drive/u/1/folders/1dSj6dRT-cyYL6biglXo38vLBeVKu8zmq?usp=sharing](https://drive.google.com/drive/u/1/folders/1dSj6dRT-cyYL6biglXo38vLBeVKu8zmq?usp=sharing)

Após o download, coloque os arquivos nesta pasta (`api/src/database/seed/data/`).

Arquivos esperados (formato consolidado):

```
sinasc-2020-2024.json
mortalidade-2020-2024.json
```
