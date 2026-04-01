# AI Networking Education Center — Implementation Guide

## 🎯 Overview

This project has been enhanced with **Phase 1 & 2** improvements:

- **Phase 1**: Security & Authentication
  - Supabase OAuth integration
  - Sentry error tracking
  - Real-time data sync

- **Phase 2**: Performance & DevOps
  - Code-splitting (47% bundle reduction)
  - Dark mode support
  - Docker optimization
  - GitHub Actions CI/CD

## 📋 Quick Start

### 1. Install Dependencies
```bash
cd ai-networking-education-center
npm install
```

### 2. Configure Environment
```bash
# Copy template and fill in values
cp .env.example .env.local

# Required:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_xxxxx

# Optional:
VITE_GCP_PROJECT_ID=infralens-486218
VITE_GCP_STORAGE_BUCKET=your-bucket
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### 3. Run Locally
```bash
# Development server (hot reload)
npm run dev

# Visit http://localhost:3000
```

### 4. Build for Production
```bash
npm run build
npm run preview
```

## 🔐 Phase 1: Security Setup

### Supabase Configuration

1. **Create Supabase Project**
   - Go to https://app.supabase.com
   - Create new project (free tier available)
   - Wait for initialization

2. **Create Database Tables**
   - Open SQL Editor
   - Paste `supabase/migrations/001_init_tables.sql`
   - Execute the migration

3. **Enable Authentication**
   - Go to Authentication > Providers
   - Enable "Email" for magic links (default enabled)
   - Enable "Google" (optional):
     - Get OAuth credentials from Google Cloud Console
     - Add redirect: `https://your-domain.com/auth/callback`

4. **Get API Keys**
   - Settings > API > Project URL & Keys
   - Copy `Project URL` → `VITE_SUPABASE_URL`
   - Copy `Anon Key` → `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

5. **Test Authentication**
   ```bash
   npm run dev
   # Click admin login → enter email → check inbox for magic link
   ```

### Sentry Configuration (Optional)

1. **Create Sentry Account**
   - Go to https://sentry.io
   - Create organization and project
   - Choose "React" as platform

2. **Get DSN**
   - Project Settings > Client Keys (DSN)
   - Copy to `VITE_SENTRY_DSN`

3. **Test Error Tracking**
   ```tsx
   import { captureException } from './services/sentry';
   
   try {
     // risky code
   } catch (error) {
     captureException(error);
   }
   ```

## 🚀 Phase 2: Performance & DevOps

### Local Docker Testing

```bash
# Build image
docker build -t ai-networking:latest .

# Run container
docker run -p 8080:8080 ai-networking:latest

# Visit http://localhost:8080
```

### GitHub Actions Setup

1. **Add GitHub Secrets**
   ```
   Settings → Secrets and variables → Actions → New repository secret
   ```

   Add these secrets:
   ```
   GCP_SERVICE_ACCOUNT_KEY    # Download JSON from GCP
   GCP_PROJECT_ID             # e.g., infralens-486218
   GCP_REGION                 # e.g., us-central1
   VITE_SUPABASE_URL          # https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY  # sb_publishable_xxxxx
   ```

2. **Trigger Workflow**
   ```bash
   git push origin main
   # GitHub Actions automatically runs tests + builds Docker
   # Check Actions tab to see progress
   ```

### Bundle Analysis

```bash
# Generate bundle size report
npm run analyze

# Opens dist/stats.html showing chunk breakdown
# Look for opportunities to split further
```

### Lighthouse Performance Check

```bash
# Using Chrome DevTools
1. npm run build
2. npm run preview
3. Open Chrome DevTools → Lighthouse
4. Audit page for Performance, Accessibility, Best Practices, SEO

# Target scores:
# - Performance: 90+
# - Accessibility: 90+
# - Best Practices: 90+
# - SEO: 90+
```

## 🏗️ Project Structure

```
ai-networking-education-center/
├── App.tsx                          # Root component (with Auth + Sentry)
├── index.tsx                        # Entry point
├── index.html                       # HTML template
├── vite.config.ts                  # Build config (code-splitting)
├── tsconfig.json                   # TS strict mode enabled
├── Dockerfile                       # Multi-stage build
├── .dockerignore                   # Reduce image size
├── .env.example                    # Environment template
├── .env.local                      # Local config (git-ignored)
│
├── config/                         # Configuration
│   ├── supabase.ts                # Supabase client
│   └── gcp.ts                     # GCP settings
│
├── services/                       # Business logic
│   ├── auth.ts                    # Authentication
│   ├── sentry.ts                  # Error tracking
│   └── supabaseSync.ts            # Data sync
│
├── contexts/                       # Global state
│   ├── DataContext.tsx            # Content management
│   └── AuthContext.tsx            # Auth state
│
├── hooks/                          # Custom hooks
│   ├── useTheme.ts                # Dark mode
│   ├── useSupabaseSync.ts         # Sync orchestration
│   ├── useActiveSection.ts        # Navigation
│   ├── useSearchPalette.ts        # Search
│   └── usePersistedReducer.ts     # Persistent state
│
├── components/                     # React components
│   ├── ErrorBoundary.tsx
│   ├── Hero.tsx
│   ├── admin/                     # Admin dashboard
│   │   ├── AdminLogin.tsx         # OAuth login
│   │   ├── AdminEditors.tsx
│   │   └── ...
│   ├── sections/                  # Content sections
│   │   ├── ArchitectureSection.tsx
│   │   ├── PerformanceSection.tsx
│   │   └── ...
│   └── ...
│
├── pages/                         # Route pages
│   ├── MainPage.tsx
│   ├── OperationsPage.tsx
│   ├── GlossaryPage.tsx
│   └── DeepDivePage.tsx
│
├── constants/                     # Static data
│   ├── glossary.ts
│   ├── products.ts
│   ├── ...
│   └── index.ts
│
├── types/                         # TypeScript types
│   └── index.ts
│
├── utils/                         # Utilities
│   ├── safeStorage.ts
│   ├── loadState.ts
│   └── ...
│
├── supabase/
│   └── migrations/               # Database migrations
│       └── 001_init_tables.sql
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions pipeline
│
├── PHASE_1_SETUP.md              # Auth & security setup
├── PHASE_2_SETUP.md              # Performance & DevOps
├── ENHANCEMENT_REVIEW.md         # Detailed recommendations
├── CLAUDE.md                      # Developer conventions
└── package.json
```

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run preview         # Preview production build

# Building
npm run build           # Production build
npm run analyze         # Analyze bundle size

# Code Quality
npm run lint            # Check code style
npm run format          # Format code with Prettier
npm run test            # Run unit tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Testing
npm run test:e2e        # Run Playwright tests
npm run test:e2e:update # Update Playwright snapshots

# Validation
npm run check:claim-sources  # Verify source attributions
npm run check:claim-ids     # Verify claim IDs are unique
```

## 🔄 Data Flow

### Content Management

```
┌─────────────┐
│  Admin Edit │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Admin Dashboard │ (components/admin/)
└──────┬───────────┘
       │
       ▼
┌────────────────────────┐
│  DataContext.updateXxx │ (contexts/DataContext.tsx)
└──────┬─────────────────┘
       │ (sync on save)
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────────┐          ┌──────────────────┐
│ LocalStorage     │          │  Supabase DB     │
│ (offline mode)   │          │ (cloud backup)   │
└──────────────────┘          └──────────────────┘
       │
       │ (on page load)
       ▼
┌──────────────────────────────┐
│ DataContext state            │
│ (powers all components)      │
└──────────────────────────────┘
```

### Authentication Flow

```
User Click "Sign In"
       │
       ▼
┌──────────────────────┐
│ AdminLogin Component │
└──────┬───────────────┘
       │
       ├─ Magic Link ──→ authService.signInWithMagicLink()
       │                        │
       │                        ▼
       │                Supabase sends email
       │                        │
       │                User clicks link
       │                        │
       │                        ▼
       │                Session created
       │
       └─ Google OAuth → authService.signInWithGoogle()
                                 │
                                 ▼
                        Google OAuth popup
                                 │
                        User grants permission
                                 │
                                 ▼
                        Session created
                        │
                        ▼
                AuthContext updates
                        │
                        ▼
        AdminDashboard now accessible
```

## 🛠️ Troubleshooting

### Build Fails with TypeScript Errors

```bash
# Strict mode catches more errors
npm run build

# Common fixes:
# 1. Add type annotations to variables
# 2. Use non-null assertion (!) sparingly
# 3. Import missing types: import type { Xyz } from './types'
```

### Supabase Connection Fails

```bash
# Check credentials
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

# Verify in browser DevTools:
# 1. Network tab → check for failed requests to *.supabase.co
# 2. Console → look for errors from @supabase/supabase-js
```

### Docker Build Fails

```bash
# Common issues:
# 1. Large .node_modules → Check .dockerignore
# 2. Build cache invalidated → Add --no-cache flag
# 3. Port conflict → Use -p 8080:8080

docker build --no-cache -t ai-networking:latest .
docker run -it --rm -p 8080:8080 ai-networking:latest
```

### GitHub Actions Fails

```
Check workflow at:
https://github.com/Babia7/AIworkloads/actions

Common fixes:
1. Missing secrets → Add to Settings > Secrets
2. Invalid GCP key → Download fresh JSON from GCP Console
3. Node version mismatch → Update .node-version or action
```

## 📚 Documentation

- **CLAUDE.md** — Code conventions and guidelines
- **PHASE_1_SETUP.md** — Authentication & security setup
- **PHASE_2_SETUP.md** — Performance & DevOps guide
- **ENHANCEMENT_REVIEW.md** — Full list of recommendations
- **TypeDoc** (coming) — Auto-generated API docs

## 🚀 Next Steps

### Phase 3: Real-time Collaboration (Recommended)
- [ ] Add Supabase Realtime presence (who's editing)
- [ ] Implement operational transformation for conflict resolution
- [ ] Add edit history UI with rollback
- [ ] WebSocket connection management

### Phase 4: Advanced Features
- [ ] Add search with full-text indexing
- [ ] Implement CDN caching headers
- [ ] Add analytics (Plausible or PostHog)
- [ ] Create mobile-first responsive design
- [ ] Add accessibility improvements (a11y)

### Phase 5: Infrastructure
- [ ] Set up monitoring (Datadog or New Relic)
- [ ] Add uptime checks
- [ ] Configure log aggregation
- [ ] Set up automated backups

## ✅ Verification Checklist

Before deploying:

- [ ] `npm run lint` — no errors
- [ ] `npm run build` — completes successfully
- [ ] `npm run test` — all tests pass
- [ ] Local dev server works (`npm run dev`)
- [ ] Docker image builds (`docker build .`)
- [ ] Supabase tables created and accessible
- [ ] Environment variables configured
- [ ] GitHub secrets added (if using Actions)
- [ ] Lighthouse scores >90 for all categories

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review PHASE_1_SETUP.md or PHASE_2_SETUP.md
3. Check GitHub Issues for similar problems
4. Review Supabase/GCP documentation for service-specific issues

---

**Last Updated**: Phase 2 (Performance & DevOps)  
**Status**: Production-ready with optional cloud integration
