# HRMS Deployment Guide

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm

### 1. Setup Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### Test Credentials (all use password: `password123`)
| Role | Email |
|------|-------|
| Employee | employee@hrms.com |
| Manager | manager@hrms.com |
| HR | hr@hrms.com |
| HR Manager | hrmanager@hrms.com |
| Finance | finance@hrms.com |

---

## Docker Compose (Production)

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your secrets

# Build and start all services
docker compose up -d --build

# Run database migrations + seed (first time only)
docker exec hrms_backend npx prisma migrate deploy
docker exec hrms_backend npm run seed
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Nginx: http://localhost:80

---

## Cloud Deployment

### Railway / Render
1. Connect your repository
2. Create PostgreSQL service
3. Set environment variables from `.env.example`
4. Deploy backend and frontend as separate services

### DigitalOcean / AWS
1. Provision a Droplet/EC2 instance (Ubuntu 22.04, 2GB+ RAM)
2. Install Docker + Docker Compose
3. Clone repository and configure `.env`
4. Run `docker compose up -d --build`
5. Configure DNS and obtain SSL certificate via Let's Encrypt:
   ```bash
   certbot certonly --standalone -d yourdomain.com
   # Copy certs to nginx/ssl/
   ```
6. Uncomment the HTTPS block in `nginx/nginx.conf`

### Environment Variables (Production)
```env
POSTGRES_PASSWORD=<strong-password>
JWT_SECRET=<64-char-random-string>
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

---

## Architecture Overview

```
Browser → Nginx (port 80/443)
              ├─ /api/* → Backend (Express + Prisma) → PostgreSQL
              └─ /*     → Frontend (Next.js)
```

### Security Measures
- JWT authentication with 7-day expiry
- bcrypt password hashing (12 rounds)
- RBAC on all protected routes
- Rate limiting (100 req/15min global, 10 req/15min for auth)
- Helmet.js security headers
- CORS configured to frontend URL only
- SQL injection protection via Prisma ORM (parameterized queries)
- Input validation via Zod
