# Phase 1 Implementation: Authentication & Error Logging

## Overview
This phase adds critical security and monitoring features:
- ✅ TypeScript strict mode for type safety
- ✅ Supabase authentication (magic link + Google OAuth)
- ✅ Supabase backend persistence
- ✅ Sentry error tracking
- ✅ Real-time data sync hooks

## What Was Added

### 1. **TypeScript Strict Mode** (`tsconfig.json`)
Enables all type-safety flags:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`

Helps catch bugs at compile time.

### 2. **Supabase Integration**

#### Files Created:
- `config/supabase.ts` — Client initialization with auto session persist + refresh
- `services/auth.ts` — Authentication service (magic link, Google OAuth, sign out)
- `services/supabaseSync.ts` — Data sync functions (with retry logic)
- `contexts/AuthContext.tsx` — Global auth state + hooks
- `hooks/useSupabaseSync.ts` — Sync DataContext ↔ Supabase

#### Features:
- **Magic Link Auth**: Passwordless sign-in via email
- **Google OAuth**: One-click sign-in with Google
- **Auto Session Refresh**: Tokens refresh automatically
- **Offline Support**: Falls back to LocalStorage if Supabase unavailable
- **Real-time Sync**: Subscribe to glossary changes

### 3. **Sentry Error Tracking** (`services/sentry.ts`)

Captures and tracks:
- Unhandled exceptions
- Performance issues
- Custom messages with severity levels

**To activate**: Set `VITE_SENTRY_DSN` in `.env.local`

### 4. **Updated Admin Login** (`components/admin/AdminLogin.tsx`)

Old: PIN-based authentication
New: OAuth-based authentication with:
- Magic link email sign-in
- Google OAuth integration
- Loading states
- Error messages
- Success confirmation

### 5. **Supabase Database Schema** (`supabase/migrations/001_init_tables.sql`)

Tables created:
- `glossary` — Searchable term definitions
- `products` — Platform/tool metadata
- `hpc_items` — HPC checklist items
- `performance_data` — Chart data
- `protocol_concepts` — Protocol info
- `admin_edit_log` — Audit trail

All tables include:
- RLS (Row Level Security) policies
- Indexes for fast queries
- Audit fields (`updated_by`, `updated_at`, `created_at`)

## Setup Instructions

### 1. Configure Supabase Credentials

**Get keys from Supabase dashboard** (`Settings > API > Project URL & Keys`):

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_xxxxx
```

### 2. Create Database Tables

Run SQL migration in Supabase SQL Editor:
```bash
# Open: https://app.supabase.com → SQL Editor → Paste contents of:
supabase/migrations/001_init_tables.sql
```

### 3. Configure Google OAuth (Optional)

In Supabase Dashboard:
1. Go to `Authentication > Providers`
2. Enable "Google"
3. Add OAuth credentials from Google Cloud Console
4. Set redirect URL: `https://your-domain.com/auth/callback`

### 4. Set Sentry DSN (Optional)

For error tracking:
```bash
# Get DSN from: https://sentry.io → Project Settings
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### 5. Test the Setup

```bash
npm run build  # Should succeed with no TypeScript errors
npm run lint   # Check for warnings
npm run test   # Run existing tests
```

## Usage Examples

### Sign In with Magic Link
```tsx
import { useAuth } from './contexts/AuthContext';

function LoginPage() {
  const { signInWithMagicLink } = useAuth();
  
  const handleSubmit = async (email: string) => {
    const { error } = await signInWithMagicLink(email);
    if (error) console.error(error);
  };
}
```

### Use Supabase Sync Hook
```tsx
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { useAuth } from './contexts/AuthContext';

function AdminDashboard() {
  const { user } = useAuth();
  const { uploadChanges } = useSupabaseSync({ 
    enabled: !!user,
    syncOnMount: true,
    realtime: true 
  });
  
  // Upload changes whenever admin edits
  const handleSave = async () => {
    await uploadChanges();
  };
}
```

### Track Errors with Sentry
```tsx
import { captureException, captureMessage } from './services/sentry';

try {
  // risky operation
} catch (error) {
  captureException(error);
  captureMessage('Operation failed', 'error');
}
```

## Breaking Changes

⚠️ **Admin Login System**

Old: Required PIN from `VITE_ADMIN_PASSWORD` env var
New: Requires Supabase account + magic link/Google OAuth

**Migration Path**:
1. Create Supabase project
2. Enable Auth (Supabase handles it)
3. Users sign in via email link or Google
4. Their `user_id` is tracked in edit logs

## Next Steps (Phase 2)

- [ ] Set up Supabase project with tables
- [ ] Configure Google OAuth
- [ ] Test magic link authentication
- [ ] Upload initial data to Supabase
- [ ] Enable real-time sync in admin dashboard
- [ ] Set up Sentry project for error tracking

## Troubleshooting

**"Missing Supabase environment variables"**
- Check `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

**"Could not resolve config/supabase"**
- Ensure `config/supabase.ts` exists in project root

**Auth button doesn't work**
- Check Supabase is running and credentials are correct
- Open browser DevTools → Network tab → check for errors

**Data not syncing from Supabase**
- Verify tables exist in Supabase → Table Editor
- Check RLS policies allow `SELECT` for public (glossary should be readable)
- Open browser console for sync errors

## Files Changed

**Created**:
- `config/supabase.ts`
- `config/gcp.ts`
- `contexts/AuthContext.tsx`
- `services/auth.ts`
- `services/sentry.ts`
- `services/supabaseSync.ts`
- `hooks/useSupabaseSync.ts`
- `supabase/migrations/001_init_tables.sql`

**Modified**:
- `App.tsx` — Added Sentry + AuthProvider wrapper
- `components/admin/AdminLogin.tsx` — OAuth integration
- `tsconfig.json` — Enabled strict mode
- `.env.example` — Updated template
- `.env.local` — Updated with new vars

**Deprecated**:
- `VITE_ADMIN_PASSWORD` env var (replaced with Supabase OAuth)
