# Meu Bolso — Frontend

Cliente web do **Meu Bolso**: **React 19**, **TypeScript** e **Vite**, com **React Router** para navegação entre páginas autenticadas.

A documentação do monorepo (backend, Docker, variáveis de ambiente e fluxo completo) está na raiz do projeto:

**[README principal](../README.md)**

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm install` | Instala dependências. |
| `npm run dev` | Servidor de desenvolvimento (HMR). |
| `npm run build` | Typecheck + bundle de produção. |
| `npm run preview` | Pré-visualização do build estático. |
| `npm run lint` | ESLint no código fonte. |

---

## Configuração

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL base da API (default `http://localhost:2030`). |

Em **Docker Compose**, o valor é definido no `.env` da raiz do repositório (ver `.env.example`).

---

## Deploy estático

Para servir o build com **Nginx** ou outro servidor estático, garanta o fallback para `index.html` em todas as rotas da SPA — ver [`nginx.conf`](nginx.conf) neste diretório.
