<div align="center">

# Meu Bolso

**Controle financeiro pessoal** — dashboard, transações, categorias, orçamentos e metas, com API própria e autenticação JWT.

[![Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Stack](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Stack](https://img.shields.io/badge/Spring%20Boot-Java-6DB33F?logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Stack](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## Visão geral

O repositório é um **monorepo** com SPA responsiva e backend RESTful: o frontend consome a API em tempo real (com fallback local onde aplicável), sessões via **access + refresh tokens**, e migrações de base de dados com **Flyway**.

| Pasta | Descrição |
|--------|------------|
| [`MeuBolsoFront/`](MeuBolsoFront/) | Interface **React + Vite + TypeScript**, roteamento com React Router. |
| [`back/`](back/) | API **Spring Boot**, persistência **PostgreSQL**, migrações **Flyway**. |

---

## Funcionalidades (alto nível)

- Autenticação: registo, login, refresh e rotas protegidas no cliente.
- Finanças: dashboard, **transações**, **categorias**, **orçamentos**, objetivos e operações de reset por utilizador.
- Documentação interativa da API em **Swagger / OpenAPI**.
- **Docker Compose** para subir frontend, backend e base de dados com um comando.

---

## Pré-requisitos

| Ferramenta | Versão sugerida |
|-------------|-----------------|
| **Node.js** | 20+ |
| **Java** | 17+ |
| **PostgreSQL** | 14+ |
| **Maven** | *incluído* (`back/mvnw` ou `mvnw.cmd` no Windows) |

---

## Início rápido (desenvolvimento local)

### 1. Base de dados

Crie a base `meubolso` no PostgreSQL e anote utilizador e palavra-passe (os defaults abaixo assumem `postgres` / `postgres`).

### 2. Backend

```bash
cd back
```

Defina pelo menos **`JWT_SECRET`** (mínimo **64 caracteres**). Exemplo (Unix):

```bash
export JWT_SECRET="substitua-por-um-segredo-aleatorio-com-pelo-menos-64-caracteres-obrigatorio"
./mvnw spring-boot:run
```

No **Windows (PowerShell)**:

```powershell
cd back
$env:JWT_SECRET="substitua-por-um-segredo-aleatorio-com-pelo-menos-64-caracteres-obrigatorio"
.\mvnw.cmd spring-boot:run
```

- **API:** `http://localhost:2030` (porta configurável)
- **Swagger UI:** `http://localhost:2030/swagger-ui/index.html`

### 3. Frontend

```bash
cd MeuBolsoFront
npm install
npm run dev
```

- **App:** `http://localhost:5173`
- Opcional: `VITE_API_URL` — por omissão `http://localhost:2030`

> **Refresh (F5) em rotas internas:** com `npm run dev`, o Vite trata o SPA. Em **Nginx** (ex.: imagem Docker), o fallback para `index.html` está em [`MeuBolsoFront/nginx.conf`](MeuBolsoFront/nginx.conf).

---

## Variáveis de ambiente — backend

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `JWT_SECRET` | **Sim** | Segredo HMAC; **≥ 64 caracteres**. |
| `SERVER_PORT` | Não | Porta HTTP (default `2030`). |
| `DB_URL` | Não | JDBC URL (default `jdbc:postgresql://localhost:5432/meubolso`). |
| `DB_USER` / `DB_PASSWORD` | Não | Credenciais PostgreSQL. |
| `JWT_ACCESS_MINUTES` | Não | Validade do access token (default `30`). |
| `JWT_REFRESH_DAYS` | Não | Validade do refresh token (default `14`). |
| `CORS_ALLOWED_ORIGINS` | Não | Origens permitidas (default `http://localhost:5173`). |
| `APP_SEED_ADMIN_*` | Não | Seed de administrador; só usado se `APP_SEED_ADMIN_ENABLED=true`. |

---

## Docker Compose (stack completa)

Ficheiros de referência: [`docker-compose.yml`](docker-compose.yml), [`.env.example`](.env.example), [`back/Dockerfile`](back/Dockerfile), [`MeuBolsoFront/Dockerfile`](MeuBolsoFront/Dockerfile).

```bash
cp .env.example .env
# Edite JWT_SECRET, palavras-passe e URLs antes de produção.
docker compose up -d --build
```

| Serviço | URL típica |
|---------|------------|
| Frontend | `http://localhost:5173` |
| API | `http://localhost:2030` |
| Swagger | `http://localhost:2030/swagger-ui/index.html` |

Parar:

```bash
docker compose down
```

Remover também o volume da base de dados:

```bash
docker compose down -v
```

---

## Testes e verificação

**Backend**

```bash
cd back
./mvnw test
```

**Frontend**

```bash
cd MeuBolsoFront
npm run lint
npm run build
```

---

## Fluxo de API (resumo)

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`
- Rotas financeiras sob `/api/...` (consumidas pelo dashboard, categorias, transações, orçamentos, etc.)
- `POST /api/finance/reset` — repor dados do utilizador autenticado

Detalhe dos contratos: **Swagger** na instância em execução.

---

<div align="center">

**Meu Bolso** — organização financeira com stack moderna e deploy reproduzível.

</div>
