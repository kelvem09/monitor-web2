# IndicaRN — Frontend

Aplicação web do **Monitor de Indicadores Municipais** (RN). Interface pública
para consulta de indicadores no mapa e painel administrativo para gestão de
indicadores, temas, estados, municípios e usuários.

> Stack: **React 19 + TypeScript + Vite**, **react-router-dom v7**, **axios**.
> A API NestJS é consumida em `../api` (Swagger em
> [`/api/docs`](http://localhost:3000/api/docs)).

---

## Pré-requisitos

- **Node.js** ≥ 20
- **pnpm** (use **sempre** `pnpm`, nunca `npm` ou `yarn`)
- API em execução em `http://localhost:3000` (ver `../api`)

## Setup rápido

```bash
pnpm install
cp .env.example .env       # ajustar VITE_API_URL se necessário
pnpm dev                   # http://localhost:5173
```

## Comandos

| Comando         | Descrição                                       |
| --------------- | ----------------------------------------------- |
| `pnpm install`  | Instala dependências                            |
| `pnpm dev`      | Servidor de desenvolvimento (Vite, HMR)         |
| `pnpm build`    | Type-check (`tsc -b`) + build de produção       |
| `pnpm preview`  | Preview do build de produção                    |
| `pnpm lint`     | ESLint (rodar antes de cada commit)             |

## Variáveis de ambiente

Vite expõe apenas variáveis com prefixo `VITE_` ao cliente.

| Variável       | Descrição              | Exemplo                 |
| -------------- | ---------------------- | ----------------------- |
| `VITE_API_URL` | Base URL da API NestJS | `http://localhost:3000` |

- `.env` — valores locais (ignorado pelo git)
- `.env.example` — template versionado, atualize sempre que adicionar uma nova
  variável
- Tipos em `src/env.d.ts` — declare cada nova `VITE_*` em `ImportMetaEnv`
- Acesse via `import.meta.env.VITE_API_URL`. **Nunca** hard-code URLs de API
  no código

---

## Funcionalidades

### Portal público

- **Mapa do Rio Grande do Norte** (`/`) — visualização coroplética dos
  indicadores por município.

### Painel administrativo (`/admin`)

Acesso exigindo autenticação JWT (`POST /auth/login`). Apenas usuários com
role `ADMIN` podem criar/editar/remover registros.

| Rota                                | Tela                       | API                       |
| ----------------------------------- | -------------------------- | ------------------------- |
| `/admin/indicadores`                | Lista de indicadores       | `GET /indicadores`        |
| `/admin/indicadores/novo`           | Criar indicador            | `POST /indicadores`       |
| `/admin/indicadores/:id/editar`     | Editar indicador           | `PATCH /indicadores/:id`  |
| `/admin/temas`                      | Lista de temas             | `GET /temas-indicadores`  |
| `/admin/temas/novo`                 | Criar tema                 | `POST /temas-indicadores` |
| `/admin/temas/:id/editar`           | Editar tema                | `PATCH /temas-indicadores/:id` |
| `/admin/estados`                    | Lista de estados           | `GET /estados`            |
| `/admin/estados/novo`               | Criar estado               | `POST /estados`           |
| `/admin/estados/:id/editar`         | Editar estado              | `PUT /estados/:id`        |
| `/admin/municipios`                 | Lista de municípios        | `GET /municipios`         |
| `/admin/municipios/novo`            | Criar município            | `POST /municipios`        |
| `/admin/municipios/:id/editar`      | Editar município           | `PUT /municipios/:id`     |
| `/admin/usuarios`                   | Lista de usuários (perfis) | `GET /users`              |
| `/admin/usuarios/novo`              | Criar usuário              | `POST /users`             |
| `/admin/usuarios/:id/editar`        | Editar usuário             | `PATCH /users/:id`        |

> Os DELETE de **indicadores** e **usuários** são **soft delete** (status
> `INATIVO` / `isActive=false`); o histórico é preservado.

---

## Estrutura

```
src/
├── lib/                      # utilitários transversais
│   ├── api.ts                # instância axios + interceptors
│   └── auth.ts               # leitura/escrita de token em localStorage
├── services/                 # chamadas HTTP por domínio
│   ├── auth.service.ts
│   ├── estados.service.ts
│   ├── municipios.service.ts
│   ├── geojson.service.ts
│   ├── indicadores.service.ts
│   ├── temas.service.ts
│   └── users.service.ts
├── components/               # componentes compartilhados
│   ├── AdminShell.{tsx,css}  # layout admin (sidebar + main)
│   ├── ConfirmDialog.{tsx,css}
│   ├── ProtectedRoute.tsx    # guard de autenticação
│   ├── PublicTopBar.{tsx,css}
│   ├── StatusBadge.{tsx,css} # badge de status (Ativo/Rascunho/Inativo)
│   ├── Toast.{tsx,css}
│   ├── toast-context.ts
│   ├── Logo.tsx
│   └── Legend.tsx
├── pages/                    # uma pasta por feature
│   ├── Login.{tsx,css}
│   ├── mapa/Mapa.{tsx,css}
│   ├── estados/
│   ├── municipios/
│   ├── temas/
│   ├── indicadores/
│   └── usuarios/
├── router.tsx                # createBrowserRouter (todas as rotas)
├── main.tsx                  # bootstrap (RouterProvider + ToastProvider)
├── index.css                 # estilos globais e tokens de design
└── env.d.ts                  # tipagem das envs do Vite
```

## Roteamento

- Lib: **`react-router-dom` v7** com `createBrowserRouter` + `RouterProvider`
- Definir rotas em `src/router.tsx`
- Páginas em `src/pages/<feature>/<Nome>.tsx` exportadas como named export
- Use `<Link>` para navegação interna; `useNavigate()` para navegação
  programática
- `<ProtectedRoute>` envolve qualquer rota que exige autenticação

## Comunicação HTTP

- Lib: **`axios`** — sempre via a instância `api` em `src/lib/api.ts`
- Não chame `axios.get`/`axios.post` direto: use `api.get`/`api.post` para
  herdar `baseURL`, headers e interceptors
- O interceptor de request adiciona automaticamente
  `Authorization: Bearer <token>` quando há token
- O interceptor de response limpa o token em respostas `401`
- Crie um service por domínio em `src/services/<dominio>.service.ts`
  exportando funções tipadas (ex.: `listIndicadores`, `createUser`)

## Autenticação

- Token salvo em `localStorage` com chave `monitor:access_token`
- Helpers em `src/lib/auth.ts`: `getToken`, `setToken`, `clearToken`,
  `isAuthenticated`
- Login em `POST /auth/login` com `{ email, password }` retorna
  `{ access_token, user }` (ver OpenAPI da API em
  `http://localhost:3000/api/docs`)
- Após login bem-sucedido, persistir o token via `setToken` e redirecionar
  para `/admin/indicadores`
- Roles disponíveis: `ADMIN`, `GESTOR_PUBLICO`. Mutating endpoints exigem
  `ADMIN` — a UI exibe toast de erro `403` quando o backend recusa

---

## Padrões de código

- **TypeScript estrito**: sem `any` implícito; tipar payloads e respostas de
  API em cada service
- **Componentes**: function components com named exports
  (`export function Login()`)
- **Imports**: usar `import type` para imports apenas de tipo
  (`verbatimModuleSyntax` está ativo)
- **CSS**: um `.css` por componente/página (`Login.tsx` ↔ `Login.css`);
  BEM-like (`.usuario-form__field`); tokens globais em `index.css`
- **Naming**:
  - componentes: `PascalCase.tsx`
  - utilitários: `camelCase.ts`
  - services: `<dominio>.service.ts`
- **Tratamento de erro de API**: usar `isAxiosError` para diferenciar
  `error.response?.status`. Padronize toasts para os status comuns:
  - `400` → "Dados inválidos. Revise os campos…"
  - `401` → "Sessão expirada. Faça login novamente."
  - `403` → "Apenas administradores podem…"
  - `404` → "{recurso} não encontrado."
  - `409` → "Já existe um {recurso} com…"
- **i18n**: textos da UI em **português brasileiro**
- **Padrão de CRUD** (ver `pages/estados`, `pages/temas`, etc.):
  - `XList.tsx` — tabela em `<AdminShell>` com busca, filtros, paginação,
    `ConfirmDialog` para deleção e `useToast` para feedback
  - `XForm.tsx` — formulário com `mode: 'create' | 'edit'`, `getX` no
    `useEffect` quando edição, payload tipado, validação client-side,
    redirect com `navigate(..., { replace: true })`

## Linting

ESLint flat config em `eslint.config.js` com `typescript-eslint`,
`react-hooks` e `react-refresh`. Rodar **`pnpm lint`** antes de commitar.

## Build de produção

```bash
pnpm build      # type-check + bundle em dist/
pnpm preview    # serve dist/ em http://localhost:4173
```

O `pnpm build` falha se houver erros de tipo — use `pnpm dev` para iteração
rápida e `pnpm build` antes de subir uma branch.
