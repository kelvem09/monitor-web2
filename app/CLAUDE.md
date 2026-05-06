# app — Monitor de Indicadores Municipais (Frontend)

Aplicação React + TypeScript + Vite. Consome a API NestJS em `../api`.

## Comandos

Use **sempre `pnpm`** (nunca `npm` ou `yarn`).

- `pnpm install` — instalar dependências
- `pnpm dev` — servidor de desenvolvimento (Vite)
- `pnpm build` — type-check (`tsc -b`) + build de produção
- `pnpm lint` — ESLint
- `pnpm preview` — preview do build de produção
- `pnpm add <pkg>` / `pnpm add -D <pkg>` — adicionar dependências

## Variáveis de ambiente

Vite expõe apenas variáveis com prefixo `VITE_` ao cliente.

- `.env` — valores locais (ignorado pelo git)
- `.env.example` — template versionado, atualize sempre que adicionar uma nova variável
- Tipos em `src/env.d.ts` — declare cada nova `VITE_*` em `ImportMetaEnv`
- Acesse via `import.meta.env.VITE_API_URL`. **Nunca** hard-code URLs de API no código

| Variável         | Descrição              | Exemplo                 |
| ---------------- | ---------------------- | ----------------------- |
| `VITE_API_URL`   | Base URL da API NestJS | `http://localhost:3000` |

## Estrutura

```
src/
├── lib/             # utilitários transversais (api, auth, etc.)
│   ├── api.ts       # instância axios + interceptors
│   └── auth.ts      # leitura/escrita de token em localStorage
├── services/        # chamadas HTTP por domínio (auth, indicadores...)
├── pages/           # componentes de rota (uma pasta por feature quando crescer)
├── router.tsx       # definição das rotas (createBrowserRouter)
├── main.tsx         # bootstrap (RouterProvider)
├── index.css        # estilos globais e tokens de design
└── env.d.ts         # tipagem das envs do Vite
```

## Roteamento

- Lib: **`react-router-dom` v7** com `createBrowserRouter` + `RouterProvider`
- Definir rotas em `src/router.tsx`
- Páginas em `src/pages/<Nome>.tsx` exportadas como named export
- Use `<Link>` para navegação interna; `useNavigate()` para navegação programática

## Comunicação HTTP

- Lib: **`axios`** — sempre via a instância `api` em `src/lib/api.ts`
- Não chame `axios.get`/`axios.post` direto: use `api.get`/`api.post` para herdar `baseURL`, headers e interceptors
- O interceptor de request adiciona automaticamente `Authorization: Bearer <token>` quando há token
- O interceptor de response limpa o token em respostas `401`
- Crie um service por domínio em `src/services/<dominio>.service.ts` exportando funções tipadas (ex.: `login`, `getIndicadores`)

## Autenticação

- Token salvo em `localStorage` com chave `monitor:access_token`
- Helpers em `src/lib/auth.ts`: `getToken`, `setToken`, `clearToken`, `isAuthenticated`
- Login em `POST /auth/login` com `{ email, password }` retorna `{ access_token, user }` (ver OpenAPI da API em `http://localhost:3000/api/docs`)
- Após login bem-sucedido, persistir o token via `setToken` e redirecionar com `useNavigate`

## Padrões de código

- **TypeScript estrito**: sem `any` implícito; tipar payloads e respostas de API em cada service
- **Componentes**: function components com named exports (`export function Login()`)
- **Imports**: usar `import type` para imports apenas de tipo (`verbatimModuleSyntax` está ativo)
- **CSS**: um `.css` por componente/página (`Login.tsx` ↔ `Login.css`); BEM-like (`.login__field`); tokens globais em `index.css`
- **Naming**: arquivos de componente em `PascalCase.tsx`; arquivos utilitários em `camelCase.ts`; services em `<dominio>.service.ts`
- **Tratamento de erro de API**: usar `isAxiosError` para diferenciar `error.response?.status`; mensagens de erro em PT-BR
- **i18n**: textos da UI em **português brasileiro**

## Linting

ESLint já configurado em `eslint.config.js` (flat config) com `typescript-eslint`, `react-hooks` e `react-refresh`. Rodar `pnpm lint` antes de commitar.
