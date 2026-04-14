# MeuBolso - Front + Backend

Aplicacao de controle financeiro pessoal com frontend React e backend Spring Boot com autenticacao JWT.

## Estrutura

- `MeuBolsoFront/`: frontend React + Vite
- `v1/v1/`: backend Spring Boot + PostgreSQL + Flyway

## Requisitos

- Node.js 20+
- Java 17+
- Maven Wrapper (`mvnw`) ja incluso
- PostgreSQL 14+

## Backend (Spring Boot)

Diretorio:

```bash
cd v1/v1
```

Variaveis de ambiente principais:

- `SERVER_PORT` (default `2030`)
- `DB_URL` (default `jdbc:postgresql://localhost:5432/meubolso`)
- `DB_USER` (default `postgres`)
- `DB_PASSWORD` (default `postgres`)
- `JWT_SECRET` (obrigatorio em producao, minimo recomendado 64+ caracteres)
- `JWT_ACCESS_MINUTES` (default `30`)
- `JWT_REFRESH_DAYS` (default `14`)
- `CORS_ALLOWED_ORIGINS` (default `http://localhost:5173`)
- `APP_SEED_ADMIN_NAME` (default `Administrador`)
- `APP_SEED_ADMIN_EMAIL` (default `admin@gggg.com`)
- `APP_SEED_ADMIN_PASSWORD` (default `admin@gggg.com`)

Executar:

```bash
./mvnw spring-boot:run
```

Swagger/OpenAPI:

- `http://localhost:2030/swagger-ui/index.html`

## Frontend (React)

Diretorio:

```bash
cd MeuBolsoFront
```

Variavel opcional:

- `VITE_API_URL` (default `http://localhost:2030`)

Executar:

```bash
npm install
npm run dev
```

## Fluxo implementado

- Login e cadastro com JWT (`/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`)
- Rotas privadas no frontend com redirecionamento para `/login`
- Dashboard, categorias, transacoes e orcamentos consumindo API real
- Reset de dados por usuario (`POST /api/finance/reset`)
- Seed automatica de admin:
  - Email: `admin@gggg.com`
  - Senha: `admin@gggg.com`

## Docker Compose (stack completa)

Arquivos adicionados:

- `docker-compose.yml` (root)
- `.env.example` (root)
- `v1/v1/Dockerfile`
- `MeuBolsoFront/Dockerfile`

Passos:

```bash
cp .env.example .env
docker compose up -d --build
```

Acessos:

- Frontend: `http://localhost:5173`
- Backend (API): `http://localhost:2030`
- Swagger: `http://localhost:2030/swagger-ui/index.html`

Parar stack:

```bash
docker compose down
```

Parar e remover volume do Postgres:

```bash
docker compose down -v
```

## Testes

Backend:

```bash
cd v1/v1
./mvnw test
```

Frontend:

```bash
cd MeuBolsoFront
npm run lint
npm run build
```
