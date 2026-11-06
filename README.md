# dall-e

**MERN stack demo** for AI image generation — **React (Vite)** + **Express** + **MongoDB** + **Cloudinary**, calling the **OpenAI Images API**.

---

## Purpose

This repository is a **learning and starter** project: you type a text prompt, the backend asks OpenAI to generate an image, and you can **save** that image to a community feed. The goal is to show a minimal but realistic flow for generative images in a web app:

- **Browse** a gallery of past generations (read from MongoDB).
- **Create** a new image from a prompt (OpenAI).
- **Share** it with the community (upload to Cloudinary, store metadata in MongoDB).

It is not a production product out of the box: there is no auth, rate limiting, or billing — treat it as a **sandbox** to clone and harden for your own use case.

---

## What’s in the box

| Part | Role |
|------|------|
| **`client/`** | React UI: gallery (`Home`), create/share flow (`CreatePost`), Tailwind styling. |
| **`server/`** | Express API: image generation (`/api/v1/dalle`), posts CRUD-ish (`/api/v1/post`), MongoDB + Cloudinary. |
| **OpenAI** | `openai.images.generate` — text prompt → image (base64 in API response). |
| **MongoDB** | Stores post documents (name, prompt, Cloudinary image URL). |
| **Cloudinary** | Hosts uploaded images when a user shares a generation. |

Env loading is centralized in `server/load-env.js` so `server/.env` is read **before** route modules run (required for ESM).

---

## How it works (high level)

1. User enters a **prompt** and clicks **Generate** → `POST /api/v1/dalle` → OpenAI returns **base64** image data → preview in the browser.
2. User clicks **Share** → `POST /api/v1/post` with name, prompt, and image payload → server uploads to **Cloudinary**, saves a record in **MongoDB**.
3. **Home** loads posts with `GET /api/v1/post` and shows cards with search.

The client’s API base URL comes from **`VITE_API_BASE_URL`** or a fallback in `client/src/config.js` (useful when the API is deployed separately from the static frontend).

---

## Repository layout

```
client/          # Vite + React app
  src/
    App.jsx      # Routes and shell
    page/        # Home, CreatePost
    components/  # Card, FormField, Loader
    config.js    # API_BASE_URL (VITE_API_BASE_URL)
server/          # Express API
  index.js       # App entry, loads load-env.js first
  load-env.js    # dotenv for server/.env
  routes/        # dalleRoutes, postRoutes
  mongodb/       # connect, Post model
```

---

## How to use

### Prerequisites

- **Node.js** and npm — **`server/package.json`** declares **`engines.node`** for **22+**. The **client** stack (Vite 8, React Router 7) still needs **Node 20.19+** or **22+** to build; Netlify must not use Node 16.
- **MongoDB** URL if you use the gallery / share flow
- **OpenAI API key** for generation
- **Cloudinary** account if you use **share** (image upload)

### Environment (server)

Copy the template and fill in values:

```bash
cp server/.env.example server/.env
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URL` | yes* | MongoDB connection string |
| `OPENAI_API_KEY` | yes | OpenAI API key for `POST /api/v1/dalle` |
| `OPENAI_IMAGE_MODEL` | no | Model for `openai.images.generate` (defaults to `gpt-image-1.5` in code if unset) |
| `CLOUDINARY_CLOUD_NAME` | yes† | Cloudinary cloud name for `POST /api/v1/post` |
| `CLOUDINARY_API_KEY` | yes† | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | yes† | Cloudinary API secret |

\*Required for listing/saving posts.  
†Required only if you use **create post** (upload). Generation alone needs `OPENAI_API_KEY`.

### Environment (client)

If the API runs on your machine (e.g. `http://localhost:8080`):

```bash
cp client/.env.example client/.env
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_BASE_URL` | no | API origin **without** a trailing slash. If unset, see default in `client/src/config.js`. |

### Run the backend

```bash
cd server
npm install
npm start
```

The API listens on **port 8080** by default (`server/index.js`).

### Run the frontend

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173`). With a local API, set `VITE_API_BASE_URL=http://localhost:8080` in `client/.env`.

### Build / preview (client)

```bash
cd client
npm run build
npm run preview
```

### Deployment: Render (API) + Netlify (frontend)

This repo has **two deployable halves**: a **static SPA** and a **long‑running API**. A common setup is **Netlify for the client** and **Render for the Express server**—each host matches the workload.

| Platform | Deploys | What runs |
|----------|---------|------------|
| **[Netlify](https://www.netlify.com/)** | `client/` | **`npm run build`** → static assets in **`client/dist`**, served on a CDN. **No MongoDB**, **no OpenAI secrets** on Netlify for this layout—only the browser bundle. |
| **[Render](https://render.com/)** | `server/` | **Web Service** runs Node and **`npm start`**. Express serves `/api/v1/*`; it reads **`MONGODB_URL`**, OpenAI, and Cloudinary from **Render environment variables**. |

The browser calls your **API URL over HTTPS**; only the server uses `MONGODB_URL`.

#### Where environment variables live

| Variable | Set on | Notes |
|----------|--------|--------|
| **`MONGODB_URL`** | **Render** (API service) | Mongoose in `server/`. Never as `VITE_*` on Netlify. |
| **`OPENAI_API_KEY`**, **`OPENAI_IMAGE_MODEL`** | **Render** | `server/routes/dalleRoutes.js`. |
| **`CLOUDINARY_CLOUD_NAME`**, **`CLOUDINARY_API_KEY`**, **`CLOUDINARY_API_SECRET`** | **Render** | `server/routes/postRoutes.js`. |
| **`VITE_API_BASE_URL`** | **Netlify** (build) | Public API origin, **no trailing slash** — e.g. `https://your-service.onrender.com`. Inlined at build time via Vite. |
| **`NODE_VERSION`** (e.g. `22`) | **Netlify** (build) | Repo ships **`client/.nvmrc`** and **`client/netlify.toml`** so the build does **not** use Node 16 (Vite 8 / Rolldown needs **Node 20.19+** or **22+**). |

**Netlify UI:** **Site configuration → Environment variables**. **Render UI:** your **Web Service → Environment**.

#### Deployment process (typical)

**Render — API**

1. **New → Web Service**, connect the Git repo.
2. **Root directory:** `server` (or set commands from repo root consistently).
3. **Build:** e.g. `npm install` (if not covered by start).
4. **Start command:** `npm start` (runs `nodemon index` in this repo).
5. **Environment:** add `MONGODB_URL`, `OPENAI_API_KEY`, optional `OPENAI_IMAGE_MODEL`, and all `CLOUDINARY_*` keys.
6. **Port:** Render sets **`PORT`**. The server listens on **`process.env.PORT`**, or **8080** locally if `PORT` is unset (`server/index.js`).
7. Deploy and copy the public URL (e.g. `https://your-service.onrender.com`).

**Netlify — frontend**

1. **New site** from Git, or `netlify link` → choose the repo remote (e.g. `gipsy/dalle`); **base directory** does **not** change which repo is linked.
2. **Build settings:** **Base directory** `client`, **Build command** `npm run build`, **Publish directory** `dist` (when base is `client`) or `client/dist` (from repo root—match Netlify’s UI).
3. **Environment:** **`VITE_API_BASE_URL`** = your **Render API URL** (no path).
4. Deploy. **SPA:** `client/netlify.toml` rewrites `/*` → `/index.html` so `/create-post` works on refresh.

**Wire-up**

- `cors({ origin: true })` in `server/index.js` allows browser calls from `*.netlify.app`.
- If **Create post** fails: check **`VITE_API_BASE_URL`**, Render **logs**, and that Render has **MongoDB + Cloudinary** env vars.

#### Optional: Render CLI

Install from **[Render CLI docs](https://render.com/docs/cli)** (`brew install render` or the official install script), then **`render login`**. Use it for **logs**, **deploys**, and **SSH** to services—not for storing secrets (still use the dashboard).

#### Netlify + API elsewhere

If you host the API **only** on Netlify (e.g. **Functions**), put secrets in **function** env, **not** `VITE_*`. The default in this repo is **static site + separate API**.

---

## API (short reference)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/` | Health-ish message from Express |
| `GET` | `/api/v1/post` | List all posts |
| `POST` | `/api/v1/post` | Create post (body: name, prompt, photo — uploads to Cloudinary) |
| `GET` | `/api/v1/dalle` | Simple hello for the DALL·E route |
| `POST` | `/api/v1/dalle` | Generate image (body: `{ "prompt": "..." }`) |

---

## Related project

Vue 3 port of a similar idea: [https://github.com/gipsy/vue-dalle](https://github.com/gipsy/vue-dalle)
