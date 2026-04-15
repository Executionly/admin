# Avertune Admin Dashboard

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL
npm run dev
```

## .env

```bash
VITE_API_URL=https://avertuneserver.xyz/api
VITE_APP_NAME=Avertune Admin
```

## Build for production

```bash
npm run build
# Deploy the dist/ folder to any static host (Vercel, Netlify, etc.)
```

## Roles & Access

| Role        | Dashboard | Users | Revenue | Analytics | Support | Chat | Affiliates | Admins | Logs | Settings |
|-------------|-----------|-------|---------|-----------|---------|------|------------|--------|------|----------|
| super_admin | ✓         | ✓     | ✓       | ✓         | ✓       | ✓    | ✓          | ✓      | ✓    | ✓        |
| admin       | ✓         | ✓     | ✓       | ✓         | ✓       | ✓    | ✓          | ✗      | ✓    | ✗        |
| support     | ✓         | ✓     | ✗       | ✗         | ✓       | ✓    | ✗          | ✗      | ✗    | ✗        |
| developer   | ✓         | ✗     | ✗       | ✓         | ✗       | ✓    | ✗          | ✗      | ✓    | ✓        |
