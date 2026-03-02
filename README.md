# MERN Real-Time Chat Application

Production-ready MERN monorepo chat application with private + group real-time chat, JWT auth, unread counts, typing indicator, seen state, last-seen presence, dark mode, and deploy configuration for Render (backend) + Vercel (frontend).

## Monorepo Structure

```bash
chat-app/
├── backend/
└── frontend/
```

## Features

- JWT authentication (`/api/auth/register`, `/api/auth/login`)
- Secure password hashing with bcrypt
- Private real-time chat with Socket.io
- Group chat support
- Online users + last seen state
- Unread message counts
- Typing indicator
- Message timestamps
- Seen indicator (`✓` and `✓✓`)
- Dark / light mode toggle
- Deploy-ready config (`render.yaml`, `frontend/vercel.json`)

## Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend env values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/chatapp
JWT_SECRET=super-secret-key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend env values:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Run both services from root

```bash
npm install
npm run install:all
npm run dev
```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users`
- `GET /api/messages/:userId`
- `GET /api/messages/group/:groupId`
- `POST /api/messages`
- `GET /api/groups`
- `POST /api/groups`

## Deployment

### Render (backend)
1. Create a new **Web Service**.
2. Point root directory to `backend`.
3. Use build command `npm install` and start command `npm start`.
4. Add env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`.

### Vercel (frontend)
1. Import project, set root directory to `frontend`.
2. Build command: `npm run build`.
3. Output dir: `dist`.
4. Add `VITE_API_URL` and `VITE_SOCKET_URL` env vars.

