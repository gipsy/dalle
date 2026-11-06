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

### Netlify

If **Base directory** is `client`, keep using Node **20.19+** or **22**. The repo includes **`netlify.toml`** (root) with `NODE_VERSION = "22"` and **`client/.nvmrc`** so the build does not fall back to Node 16 (which breaks Vite 8 / Rolldown with `util.styleText`).

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
