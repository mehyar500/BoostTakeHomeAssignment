# Boost URL Shortener

A fully‑typed TypeScript microservice that shortens URLs, stores them in Postgres, and redirects visitors.

---

## ✨ Features
| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/api/urls` | **POST** | Shorten a long URL. Optional `expiresAt` ISO string. Dedupes existing. |
| `/api/urls` | **GET** | List all shortened URLs (newest first). |
| `/:code` | **GET** | Redirect to original URL & increment hit counter. |
| `/docs` | **GET** | Swagger‑UI generated from `swagger.json`. |
| `/healthz` | **GET** | Liveness probe for orchestration. |

* Bonus: rate‑limiting, expiration logic, hit analytics, duplicate detection.

---

## 🛠 Tech Stack

| Layer | Technology | Why |
| ----- | ---------- | --- |
| Runtime | **Node 20** + **TypeScript 5** | LTS, native ESM, strict typing |
| Web API | **Express 5** + `express-async-errors` | Minimal but battle‑tested |
| ORM | **Prisma 5** | Generates TS types, migrations, fast DX |
| DB | **Postgres 15** (Docker) | ACID, indexing |
| Docs | **Swagger‑UI** | Self‑describing API, live tester |
| Validation | **Zod** | Runtime & compile‑time schema enforcement |
| Testing | **Jest** + **Supertest** | E2E HTTP assertions |
| Dev Ops | **Docker Compose** + **GitHub Actions** | Parity across dev/stage/prod |

---

## ⚙️ Requirements

* Docker Desktop
* Node 20 LTS
* pnpm / npm / yarn (guide assumes **npm**)
* `git` CLI

---

## 🚀 Local Development

```bash
git clone https://github.com/mehyar500/BoostTakeHomeAssignment.git && cd BoostTakeHomeAssignment
npm install                         # install dependencies
cp .env.example .env.dev            # create local env
docker compose up --build -d        # start Postgres + API (nodemon hot‑reload)
docker compose exec api npx prisma migrate dev --name init   # create & apply initial migration
start http://localhost:3000/docs    # (Windows) open Swagger
```

### Common npm scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Local nodemon watch (without Docker) |
| `npm run build` | Transpile TypeScript to `dist/` |
| `npm start` | Run compiled JS (prod) |
| `npm test` | Jest test suite |
| `npm run prisma:generate` | Regenerate Prisma client |

### Database Management

| Command | Purpose |
| ------- | ------- |
| `docker compose exec api npx prisma migrate dev --name <name>` | Create and apply new migration |
| `docker compose exec api npx prisma migrate deploy` | Apply existing migrations (production) |
| `docker compose exec api npx prisma db push` | Push schema changes directly (development) |
| `docker compose exec api npx prisma studio` | Open Prisma Studio database browser |

---

## 🌿 Environment Variables

```dotenv
# .env.example
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@db:5432/shortener?schema=public"
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=100
```

*For prod, override `DATABASE_URL` & `PORT` via GitHub Secrets.*

---

---

## 🔧 Testing API Routes

### Using Swagger UI (Recommended)
Visit `http://localhost:3000/docs` for an interactive API explorer with live testing capabilities.

### Using cURL Commands

#### 1. Health Check
```bash
curl http://localhost:3000/healthz
```
Expected: `{"status":"ok"}`

#### 2. Create Short URL (without expiration)
```bash
curl -X 'POST' \
  'http://localhost:3000/api/urls' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://www.example.com/very/long/url/path"
  }'
```
Expected: `{"code":"abc123","shortUrl":"http://localhost:3000/abc123"}`

#### 3. Create Short URL (with expiration)
```bash
curl -X 'POST' \
  'http://localhost:3000/api/urls' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://www.example.com/temporary/link",
    "expiresAt": "2025-12-31T23:59:59.000Z"
  }'
```
Expected: `{"code":"def456","shortUrl":"http://localhost:3000/def456"}`

#### 4. Test Redirect
```bash
# Follow redirects
curl -L http://localhost:3000/abc123

# Or check redirect without following
curl -I http://localhost:3000/abc123
```
Expected: `302 Found` with `Location` header pointing to original URL

#### 5. List All URLs
```bash
curl http://localhost:3000/api/urls
```
Expected: Array of URL objects with metadata

#### 6. Test Error Cases

**Invalid URL:**
```bash
curl -X 'POST' \
  'http://localhost:3000/api/urls' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"url": "not-a-valid-url"}'
```
Expected: `400 Bad Request`

**Past expiration date:**
```bash
curl -X 'POST' \
  'http://localhost:3000/api/urls' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "url": "https://www.example.com",
    "expiresAt": "2020-01-01T00:00:00.000Z"
  }'
```
Expected: `400 Bad Request` with "Expiration date must be in the future"

**Non-existent short code:**
```bash
curl -I http://localhost:3000/nonexistent
```
Expected: `404 Not Found`

### Rate Limiting Test
```bash
# Send 101 requests quickly to test rate limiting
for i in {1..101}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3000/api/urls \
    -H 'Content-Type: application/json' \
    -d '{"url":"https://example.com/'$i'"}'
done
```
Expected: First 100 should return `201`, 101st should return `429 Too Many Requests`

### Testing with Different Tools

**Using HTTPie:**
```bash
# Install: pip install httpie
http POST localhost:3000/api/urls url=https://www.example.com
```

**Using Postman:**
1. Import the `swagger.json` file
2. Set base URL to `http://localhost:3000`
3. Test endpoints interactively

**Using VS Code REST Client:**
Create a `.http` file:
```http
### Health Check
GET http://localhost:3000/healthz

### Create Short URL
POST http://localhost:3000/api/urls
Content-Type: application/json

{
  "url": "https://www.example.com/test",
  "expiresAt": "2025-12-31T23:59:59.000Z"
}

### List URLs
GET http://localhost:3000/api/urls

### Test Redirect
GET http://localhost:3000/{{shortCode}}
```

## 🐳 Docker Workflows

### Dev Compose

`docker-compose.yml` includes:

* **db** – Postgres 15 with named volume `pgdata` for persistence  
* **api** – Node 20 container running `npm run dev`

Stop & remove containers but keep data:

```bash
docker compose down          # containers gone
docker volume ls             # pgdata persists
```

### Production Image

```bash
docker build -t boost-url-shortener:latest .
docker run -p 8080:3000 --env-file .env.prod boost-url-shortener:latest
```

Multi‑stage build ⇒ ~80 MB final image.

---

## 🛫 CI/CD (GitHub Actions)

* `ci.yml` – lint, test, build, push to GitHub Container Registry  
* Add a second job to SSH or deploy to ECS/Kubernetes as needed.

---

## 🧩 Scaling Notes

* **Caching:** Redis/LRU in front of Postgres for hot redirects  
* **Sharding:** Prefix shortCodes (`a/abc123`) to distribute across DB partitions  
* **Blue/Green:** Tag images `main‑<sha>` and update compose stack atomically

---

---

## 📑 License

MIT – do whatever you want, just give credit.  
© 2025, Mehyar Swelim