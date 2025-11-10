# Deployment Guide - SSII IA Platform

## 🚀 Vercel Deployment (Frontend)

### Configuration Monorepo

**IMPORTANT:** Pour déployer l'application Next.js dans un monorepo, vous devez configurer le **Root Directory** dans l'interface Vercel.

### Étapes de déploiement :

1. **Allez dans les paramètres du projet Vercel**
   - Dashboard → Votre projet → Settings

2. **Configurez le Root Directory**
   - General → Root Directory
   - **Définir à :** `apps/web`
   - Framework Preset: **Next.js**

3. **Build & Development Settings**
   Les paramètres suivants seront automatiquement détectés :
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

4. **Variables d'environnement**
   Ajoutez dans Settings → Environment Variables :
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.com
   DATABASE_URL=postgresql://...
   ```

### Alternative : Configuration automatique

Si vous préférez une configuration via code, créez un fichier `.vercelignore` :

```
# .vercelignore
packages/
apps/api/
scripts/
docker-compose.yml
Makefile
```

---

## 🐍 Backend API Deployment (FastAPI)

### Options de déploiement :

#### Option 1 : Railway.app
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd apps/api
railway up
```

#### Option 2 : Render.com
1. Connectez votre repo GitHub
2. Créez un nouveau Web Service
3. Configuration :
   - **Root Directory:** `apps/api`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3.10+

#### Option 3 : DigitalOcean App Platform
1. Créez une nouvelle App
2. Configurez :
   - **Source Directory:** `apps/api`
   - **Run Command:** `python main.py`
   - Environment Variables: DATABASE_URL, JWT_SECRET, etc.

---

## 🗄️ Database Deployment (PostgreSQL + Redis)

### Option 1 : Supabase (PostgreSQL)
```bash
# Get connection string from Supabase dashboard
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

### Option 2 : Railway.app (PostgreSQL + Redis)
```bash
# Add PostgreSQL plugin
railway add postgresql

# Add Redis plugin
railway add redis

# Get connection strings
railway variables
```

### Option 3 : Render.com (PostgreSQL)
- Create PostgreSQL database
- Copy connection string to environment variables

---

## 📦 Complete Deployment Checklist

- [ ] Configure Vercel Root Directory to `apps/web`
- [ ] Deploy PostgreSQL database
- [ ] Deploy Redis instance
- [ ] Deploy FastAPI backend
- [ ] Update `NEXT_PUBLIC_API_URL` in Vercel
- [ ] Update `DATABASE_URL` in backend
- [ ] Run database migrations: `npm run db:migrate:prod`
- [ ] Seed initial data (optional): `npm run db:seed`
- [ ] Test authentication flow
- [ ] Test project creation
- [ ] Monitor logs and errors

---

## 🔧 Environment Variables

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-api.railway.app
DATABASE_URL=postgresql://... (for Prisma if needed)
```

### Backend (Railway/Render)
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
CORS_ORIGINS=https://your-app.vercel.app
NODE_ENV=production
```

---

## 🔍 Monitoring

### Logs
- **Vercel:** Dashboard → Deployments → Logs
- **Railway:** `railway logs`
- **Render:** Dashboard → Logs

### Health Checks
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-api.railway.app/health`
- API Docs: `https://your-api.railway.app/docs`

---

## 🆘 Troubleshooting

### Build fails on Vercel
- Vérifiez que Root Directory = `apps/web`
- Vérifiez les logs de build
- Testez localement : `cd apps/web && npm run build`

### API connection errors
- Vérifiez CORS_ORIGINS dans le backend
- Vérifiez NEXT_PUBLIC_API_URL dans Vercel
- Testez : `curl https://your-api.railway.app/health`

### Database connection errors
- Vérifiez DATABASE_URL
- Vérifiez que l'IP est autorisée (whitelist)
- Testez la connexion manuellement

---

## 📚 Resources

- [Vercel Monorepo Guide](https://vercel.com/docs/concepts/monorepos)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
