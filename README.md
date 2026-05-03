# CARVO — Vehicle Logistics Platform

Production-grade rebuild of `www.carvo.sa` for B2B (insurance carriers, SOS providers, fleet operators) and individual customers, with a content-managed AI assistant (chat + live voice).

## What's in here

```
carvo-v2/
├── backend/      Express + SQLite API · Gemini proxy · admin auth
├── frontend/     Public marketing site (React 19 + Vite + Tailwind)
├── admin/        Admin console (React 19 + Vite + Tailwind)
├── docker-compose.yml
└── .env.example
```

Three apps, one backend. The backend is the single source of truth — services, FAQs, site copy, AI knowledge, AI settings, and leads all live in SQLite and are managed from the admin console. The public site reads everything from the API at runtime, so editing the admin updates the site immediately.

---

## Architecture at a glance

| Concern               | Where it lives                                                       |
| --------------------- | -------------------------------------------------------------------- |
| Service catalog       | `services` table → public `/api/services` → ServicesGrid + detail pages |
| AI brain              | `ai_settings` row + active services + active FAQs                    |
| AI chat               | Frontend → `POST /api/ai/chat` → backend → Gemini Flash → DB log     |
| AI voice              | Frontend → `POST /api/ai/voice-token` → Gemini Live SDK (browser)    |
| Hero copy / contact   | `site_content` key/value table                                       |
| Inbound forms         | `leads` table                                                        |
| Bilingual (EN / AR)   | `*_en` / `*_ar` columns everywhere; `dir` toggled at app shell       |

---

## 1. Local development

You need Node 20+ and npm. Three terminals:

### Terminal 1 — Backend
```bash
cd backend
cp .env.example .env       # then edit .env
npm install
npm run dev                # http://localhost:4000
```

On first run the backend creates `data/carvo.db`, seeds default services / FAQ / AI settings / hero content, and **prints the bootstrap admin credentials to the log**. Save them.

### Terminal 2 — Public frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

### Terminal 3 — Admin console
```bash
cd admin
cp .env.example .env
npm install
npm run dev                # http://localhost:5174
```

Sign in to the admin console with the credentials printed in the backend log on first run.

---

## 2. Environment variables

### `backend/.env`
| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default 4000) |
| `JWT_SECRET` | **Required.** Long random string for admin sessions. `openssl rand -hex 48` |
| `ADMIN_DEFAULT_EMAIL` / `ADMIN_DEFAULT_PASSWORD` | Used only on first run, when the users table is empty |
| `GEMINI_API_KEY` | **Required for AI features.** Get one at https://aistudio.google.com/apikey |
| `CORS_ORIGINS` | Comma-separated allow-list (e.g. `https://www.carvo.sa,https://admin.carvo.sa`) |
| `DB_PATH` | Defaults to `./data/carvo.db` |
| `UPLOADS_DIR` | Defaults to `./uploads` |

### `frontend/.env` and `admin/.env`
| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | API origin. Empty (`""`) for production when nginx proxies `/api`. `http://localhost:4000` for local dev. |

---

## 3. The AI brain (most important piece)

The chat & voice assistant don't have hardcoded knowledge — every response is built from the database. The system instruction sent to Gemini is assembled per-request from:

1. **Company overview** — narrative description of CARVO
2. **Knowledge base** — free-form notes, internal rules, edge cases
3. **Persona instructions** — tone, escalation rules, ground rules
4. **Active services** — title + description + highlights of every visible service
5. **Active FAQs** — every active question/answer pair

Plus settings: `primary_language` (auto / ar / en), `accent` (Saudi, Gulf, MSA, Levantine, Egyptian, neutral), `chat_mode` (professional / friendly / concise / detailed), and `voice_name` (Kore, Puck, etc. for live voice).

**To "feed" the AI:** open the admin console → **AI Knowledge** → edit the four text panels → Save. Effect is immediate. No deploy.

Chat conversations are logged to the `chat_logs` table. Open them in **AI Knowledge → Conversation Logs** to spot questions the AI handled poorly and update the knowledge base accordingly.

### A note on the live voice token
`POST /api/ai/voice-token` currently returns the Gemini API key directly so the browser can establish a Live SDK websocket. This matches the security posture of the existing site. When Google ships ephemeral-token GA, swap that endpoint to mint short-lived tokens (file: `backend/src/routes/ai.js`).

---

## 4. Production deployment (recommended: Docker Compose)

```bash
cp .env.example .env
# fill in JWT_SECRET, GEMINI_API_KEY, ADMIN_DEFAULT_PASSWORD, CORS_ORIGINS
docker compose up -d --build
```

That brings up three containers on a private bridge network:

- `carvo-backend` — Express on port 4000 (not exposed to host)
- `carvo-frontend` — Nginx serving the public site on host port `8080`
- `carvo-admin` — Nginx serving the admin console on host port `8081`

The frontend and admin nginx instances each reverse-proxy `/api/*` and `/uploads/*` to the backend container by service name (`backend:4000`).

SQLite data and uploads are persisted in named volumes (`carvo_data`, `carvo_uploads`).

### Putting it behind your real domain (nginx on host or another reverse proxy)

You probably already have nginx or Coolify routing `www.carvo.sa` to your VPS. Point your reverse proxy:

| Domain | Proxies to |
| --- | --- |
| `https://www.carvo.sa`   | `http://localhost:8080` (frontend container) |
| `https://admin.carvo.sa` | `http://localhost:8081` (admin container) |

Or, if you'd rather use a single domain with a path prefix:

| Path | Proxies to |
| --- | --- |
| `https://carvo.sa/`        | `localhost:8080` |
| `https://carvo.sa/admin/`  | `localhost:8081` (note: admin is a SPA, host on a subdomain or rebuild with a base path) |

### Without Docker

Each app has a vanilla Vite/Node stack:

```bash
# Backend (long-running)
cd backend && npm install && NODE_ENV=production node src/server.js

# Frontend
cd frontend && npm install && npm run build
# serve frontend/dist with nginx; reverse-proxy /api → backend

# Admin
cd admin && npm install && npm run build
# serve admin/dist with nginx; reverse-proxy /api → backend
```

A reference nginx server block:

```nginx
server {
    listen 443 ssl http2;
    server_name www.carvo.sa carvo.sa;
    root /var/www/carvo/frontend;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:4000;
    }

    location / { try_files $uri $uri/ /index.html; }
}
```

---

## 5. Day-to-day admin workflow

| Task | Where |
| --- | --- |
| Add or edit a service card | Services → New / Edit |
| Reorder service cards | Services → Edit → Sort order |
| Hide a service temporarily | Services → Edit → uncheck Active |
| Update hero video / copy | Site Content → Hero |
| Add a new FAQ to the public site **and** AI | FAQs → New |
| Train the AI on internal rules | AI Knowledge → Knowledge & FAQ |
| Change the AI's tone or accent | AI Knowledge → Voice & Language |
| Disable voice or chat globally | AI Knowledge → Persona & Welcome |
| Triage inbound leads | Leads → click a card → set status |
| Spot-check AI quality | AI Knowledge → Conversation Logs |

---

## 6. Project layout reference

```
backend/
├── src/
│   ├── db.js                   schema + auto-seed
│   ├── server.js               Express bootstrap, CORS, helmet
│   ├── middleware/auth.js      JWT
│   └── routes/
│       ├── auth.js             /api/auth/*
│       ├── services.js         /api/services + /api/services/admin/*
│       ├── content.js          /api/content + /api/content/admin
│       ├── faqs.js             /api/faqs + /api/faqs/admin/*
│       ├── ai.js               /api/ai/* (chat proxy + voice token + admin)
│       └── leads.js            /api/leads + /api/leads/admin/*
└── data/                       carvo.db lives here

frontend/
├── src/
│   ├── App.tsx                 router + shell
│   ├── main.tsx                providers
│   ├── context/
│   │   ├── I18nContext.tsx     EN/AR + dir
│   │   └── SiteDataContext.tsx loads services, content, FAQs, AI config
│   ├── lib/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── components/
│   │   ├── Hero.tsx            cinematic GPS-video hero
│   │   ├── Navbar.tsx
│   │   ├── PartnerMarquee.tsx
│   │   ├── ServicesGrid.tsx    reads /api/services
│   │   ├── ServiceIcon.tsx
│   │   ├── B2BSection.tsx      insurance / SOS / fleet tracks
│   │   ├── ProcessSection.tsx
│   │   ├── StatsBand.tsx
│   │   ├── FaqSection.tsx
│   │   ├── ContactSection.tsx  posts to /api/leads
│   │   ├── Footer.tsx
│   │   ├── AIAssistant.tsx     backend-driven chat + Gemini Live voice
│   │   └── Logo.tsx            preserved from original brand
│   └── pages/
│       ├── HomePage.tsx
│       └── ServiceDetailPage.tsx

admin/
├── src/
│   ├── App.tsx                 router + auth gate
│   ├── lib/
│   │   ├── api.ts              JWT-aware fetch wrapper
│   │   └── auth.tsx            useAuth hook
│   ├── components/AdminLayout.tsx
│   └── pages/
│       ├── LoginPage.tsx
│       ├── DashboardPage.tsx
│       ├── ServicesPage.tsx
│       ├── AIPage.tsx          ⭐ knowledge + persona + voice + logs
│       ├── FaqsPage.tsx
│       ├── ContentPage.tsx
│       └── LeadsPage.tsx
```

---

## 7. Brand notes (preserved from original)

The visual identity stays:
- **Display font:** Bebas Neue
- **Body:** Inter
- **Arabic body:** IBM Plex Sans Arabic
- **Mono / HUD:** JetBrains Mono
- **Brand silver gradient:** preserved on the wings emblem and primary CTAs
- **Gold accent:** new `#c9a96e → #8a6f3d` highlight, used sparingly on hero title accents and service hover states

The hero now uses your existing GPS map video (`gps.mp4`) full-bleed, with topographic line overlays, a subtle radar sweep, mono HUD chips ("DISPATCH ONLINE", live coordinates), and gold-accented headline. Service cards live on a layered dark canvas that breaks the monotony of the all-white original.

Arabic readers get RTL flow automatically, the Arabic display font, and mirrored arrow icons throughout.

---

## 8. Security checklist before going live

- [ ] Generate a real `JWT_SECRET` (`openssl rand -hex 48`)
- [ ] Change the default admin password after first login (`/api/auth/change-password` is wired up; UI helper TBD — for now, sign in once and call from a tool like curl, or temporarily set `ADMIN_DEFAULT_PASSWORD` to a strong value before first boot)
- [ ] Set `CORS_ORIGINS` to your real domains only
- [ ] Lock the `admin.carvo.sa` subdomain behind HTTPS + a strong cert
- [ ] Back up `carvo_data` volume regularly (it contains the entire content DB)
- [ ] Rotate `GEMINI_API_KEY` quarterly; consider adding billing alerts in Google AI Studio

---

## 9. Roadmap suggestions

- Image uploads for services (multer endpoint already wired; admin UI hookup next)
- Webhook on new lead → Slack / Microsoft Teams
- Map-based service area editor in admin
- Replace direct API key in `/api/ai/voice-token` with ephemeral token once Google releases GA
- Migrate SQLite → Postgres if multi-instance is needed
