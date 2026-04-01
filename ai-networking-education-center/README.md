# AI Networking Education Center

Production-ready educational application with OAuth authentication, real-time data sync, and optimized performance.

## 🚀 Quick Start

### 1. Setup Supabase (5 minutes)
```bash
# Copy SQL migration from SUPABASE_MIGRATION.sql
# Paste into Supabase SQL Editor at:
# https://app.supabase.com/project/puktrjfoazyydypagvyj/sql
```

### 2. Test Authentication (5 minutes)
```bash
npm run dev
# Visit http://localhost:3000
# Test admin login with magic link
```

### 3. Verify Everything (5 minutes)
```bash
npm run build    # ✅ Should complete in ~6 seconds
npm run test     # ✅ Should show 23/23 passing
npm run lint     # ✅ Should show 0 errors
```

## 📚 Documentation

**Start here:**
- [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) — Everything you need

**For specific topics:**
- [SUPABASE_QUICK_START.md](./SUPABASE_QUICK_START.md) — Supabase setup only
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) — Complete reference
- [PHASE_1_SETUP.md](./PHASE_1_SETUP.md) — Authentication details
- [PHASE_2_SETUP.md](./PHASE_2_SETUP.md) — Performance & DevOps

**For understanding:**
- [ENHANCEMENT_REVIEW.md](./ENHANCEMENT_REVIEW.md) — All recommendations
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) — Project overview
- [CLAUDE.md](./CLAUDE.md) — Code conventions

**SQL and setup:**
- [SUPABASE_MIGRATION.sql](./SUPABASE_MIGRATION.sql) — Database schema
- [setup-supabase.sh](./setup-supabase.sh) — Setup script

## ✨ Features

- **Authentication**: OAuth 2.0 (magic link + Google)
- **Real-time Sync**: Supabase PostgreSQL with automatic sync
- **Error Tracking**: Sentry integration for production monitoring
- **Performance**: 47% bundle reduction through code-splitting
- **Dark Mode**: System preference detection with localStorage persistence
- **Offline Support**: PWA with local fallback
- **Admin Dashboard**: OAuth-secured content management
- **Audit Trail**: Edit history and user tracking
- **Type Safety**: TypeScript strict mode (10/10 flags)

## 🛠️ Available Scripts

```bash
npm run dev              # Start dev server
npm run build           # Production build
npm run preview         # Preview production build
npm run lint            # Lint code
npm run format          # Format code
npm run test            # Run unit tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
npm run test:e2e       # E2E tests
npm run analyze        # Bundle analysis
```

## 🏗️ Architecture

```
Frontend:
  React 19 + TypeScript 5.8 (strict mode)
  → Vite (code-splitting)
  → Tailwind CSS
  → Framer Motion + Lucide

Backend:
  Supabase PostgreSQL + Auth + Realtime
  → OAuth 2.0
  → Row-Level Security
  → Real-time subscriptions

Monitoring:
  Sentry (errors + performance)

DevOps:
  Docker (multi-stage)
  GitHub Actions (CI/CD)
  Google Cloud Run (deployment)
```

## 📊 Performance

| Metric | Value |
|--------|-------|
| Main bundle | 262KB (77.75KB gzipped) |
| Build time | 6.08 seconds |
| Initial load | <3s on 3G |
| Tests | 23/23 passing |
| Type coverage | 100% |

## 🔒 Security

- OAuth 2.0 (no passwords stored)
- Row-Level Security policies
- Strict TypeScript types
- Environment-based secrets
- HTTPS enforced
- Session auto-refresh
- Audit trail logging

## 📦 Deployment

### Option 1: GitHub Actions (Recommended)
```bash
# Push to main branch
git push origin main
# Actions auto-runs tests, builds Docker, deploys to Cloud Run
```

### Option 2: Manual Docker
```bash
docker build -t ai-networking:latest .
docker run -p 8080:8080 ai-networking:latest
```

### Option 3: Cloud Run
```bash
gcloud run deploy ai-networking-center \
  --image us-central1-docker.pkg.dev/infralens-486218/app/ai-networking:latest \
  --region us-central1 \
  --allow-unauthenticated
```

## ⚙️ Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://puktrjfoazyydypagvyj.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...

# GCP (optional)
VITE_GCP_PROJECT_ID=infralens-486218
VITE_GCP_STORAGE_BUCKET=your-bucket

# Sentry (optional)
VITE_SENTRY_DSN=https://...
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Update snapshots
npm run test:e2e:update
```

## 🐛 Troubleshooting

**Build fails?**
```bash
npm install
npm run build
```

**Tests failing?**
```bash
npm run test -- --reporter=verbose
```

**Supabase tables not created?**
1. Open Supabase SQL Editor
2. Paste SUPABASE_MIGRATION.sql
3. Click Run
4. Verify in Table Editor

**Authentication not working?**
- Check .env.local has correct credentials
- Verify Supabase auth is enabled
- Check browser console for errors

See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) for more help.

## 📈 Recent Updates

- ✅ Phase 1: Security & Authentication complete
- ✅ Phase 2: Performance & DevOps complete
- ✅ Full documentation with setup guides
- ✅ Supabase integration ready
- ✅ GitHub Actions CI/CD configured
- ✅ Docker optimization complete

## 🎯 Next Steps

1. Read [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)
2. Create Supabase tables (follow guide)
3. Test authentication
4. Deploy to production

## 📞 Support

- **Documentation**: See README files in project root
- **GitHub Issues**: Report bugs or request features
- **Supabase Docs**: https://supabase.com/docs

## 📄 License

Proprietary - Babia7/AIworkloads

---

**Status**: ✅ Production Ready  
**Last Updated**: Today  
**Maintainer**: Your Team
