# Trading Journal — Backend (Railway)

Fastify + Drizzle API for the Trading Journal SPA, backed by a **Supabase**
Postgres database. Auth is JWT (Bearer token); screenshots are stored on a
Railway persistent Volume.

## Stack
- **Fastify 5** — HTTP server
- **Drizzle ORM** + **postgres.js** — access & migrations against Supabase Postgres
- **@fastify/jwt** — JWT auth (Bearer header)
- **bcryptjs** — server-side password hashing
- **@fastify/multipart** — screenshot uploads → disk (Railway Volume)

## API
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/signup` | – | Create account, returns `{ token, user }` |
| POST | `/auth/login` | – | Log in, returns `{ token, user }` |
| GET | `/auth/me` | ✓ | Current user |
| GET | `/trades` | ✓ | List the user's trades |
| POST | `/trades` | ✓ | Create a trade |
| PATCH | `/trades/:id` | ✓ | Update a trade |
| DELETE | `/trades/:id` | ✓ | Delete a trade (+ its screenshots) |
| POST | `/screenshots` | ✓ | Upload one image (`file` field), returns `{ id }` |
| GET | `/screenshots/:id` | ✓ | Stream the image |
| DELETE | `/screenshots/:id` | ✓ | Delete an image |
| GET | `/health` | – | Liveness probe |

## Local development
```bash
cd server
cp .env.example .env          # fill in DATABASE_URL + JWT_SECRET
npm install
npm run db:generate           # create SQL migration from schema.ts
npm run db:migrate            # apply it to your Postgres
npm run dev                   # http://localhost:8080
```

## Deploy to Railway
1. **New Project → Deploy from GitHub repo**, pick this repo.
2. In the service **Settings → Root Directory**, set `server` (this is a subfolder).
3. **Create a Supabase project** (supabase.com). In **Project Settings → Database
   → Connection string**, copy the **Session pooler** URI (port 5432) and append
   `?sslmode=require` — this is your `DATABASE_URL`. (The session pooler is IPv4
   and supports the advisory locks Drizzle migrations need.)
4. Service **Variables**:
   - `DATABASE_URL` = the Supabase session-pooler URI from step 3 (with `?sslmode=require`)
   - `JWT_SECRET` = a long random string
   - `CORS_ORIGIN` = your Vercel URL(s), comma-separated (e.g. `https://your-app.vercel.app`)
   - `UPLOAD_DIR` = `/data/uploads`
   - (`PORT` is provided by Railway automatically.)
5. **Add a Volume** (service → New → Volume) mounted at `/data` so uploaded
   screenshots survive redeploys. `UPLOAD_DIR` above points inside it.
6. Deploy. Build runs `npm install && npm run build`; start runs
   `npm run db:migrate && npm start` (see `railway.json`).
7. Copy the service's public URL and set it as `VITE_API_URL` in Vercel.

> ⚠️ Without the Volume (step 5), Railway's container filesystem is ephemeral
> and screenshots are lost on every redeploy.
