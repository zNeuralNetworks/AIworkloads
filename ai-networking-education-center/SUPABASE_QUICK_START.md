# Quick Setup: Supabase Configuration

## Step 1: Create Database Tables (5 minutes)

Your Supabase project is already configured:
- **URL**: https://puktrjfoazyydypagvyj.supabase.co
- **Credentials**: Already in `.env.local`

**To set up tables:**

1. **Open Supabase Dashboard**
   ```
   https://app.supabase.com/project/puktrjfoazyydypagvyj/sql
   ```

2. **Create New Query**
   - Click "New Query" button
   - Or click SQL Editor in sidebar

3. **Paste SQL Migration**
   - Open: `supabase/migrations/001_init_tables.sql`
   - Copy entire contents
   - Paste into SQL editor

4. **Execute**
   - Click "Run" or Cmd+Enter
   - Wait for success message
   - Should see "Query successful" at bottom

5. **Verify Tables**
   - Go to "Table Editor" in sidebar
   - Should see 6 new tables:
     - `glossary`
     - `products`
     - `hpc_items`
     - `performance_data`
     - `protocol_concepts`
     - `admin_edit_log`

## Step 2: Test Authentication (5 minutes)

```bash
# Start dev server
npm run dev

# Open browser to http://localhost:3000
# Click "Admin" or find admin login
# Enter any email (e.g., test@example.com)
# Check browser console for link (since email won't send in dev)
```

Or use Supabase Testing:
```bash
# In another terminal, check auth status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://puktrjfoazyydypagvyj.supabase.co/rest/v1/auth/user \
  -H "apikey: sb_publishable_gBEp_3g8ZjgxJXI_BgjkWA_i8RlNUrW"
```

## Step 3: Optional - Enable Google OAuth

1. **Get Google OAuth Credentials**
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add redirect URI: `https://puktrjfoazyydypagvyj.supabase.co/auth/v1/callback`

2. **Configure in Supabase**
   - Dashboard → Authentication → Providers
   - Click "Google"
   - Paste Client ID and Client Secret
   - Click "Save"

## Step 4: Initialize Data (Optional)

Current app behavior note:
- Supabase auth can be configured now.
- Full shared persistence across every admin-editable dataset is not wired yet.
- Runtime edits still persist locally in the browser unless broader sync wiring is added later.

Load sample data into Supabase:

```bash
# Create a Node.js script to upload data
cat > seed-supabase.js << 'JS'
import { createClient } from '@supabase/supabase-js'
import { GLOSSARY, PRODUCTS, HPC_CHECKLIST_DEFAULT } from './constants/index.js'

const supabase = createClient(
  'https://puktrjfoazyydypagvyj.supabase.co',
  'sb_publishable_gBEp_3g8ZjgxJXI_BgjkWA_i8RlNUrW'
)

async function seed() {
  console.log('Seeding glossary...')
  const glossaryArray = Object.entries(GLOSSARY).map(([term, definition]) => ({
    term,
    definition,
    created_at: new Date().toISOString(),
  }))
  await supabase.from('glossary').insert(glossaryArray)

  console.log('Seeding products...')
  await supabase.from('products').insert(PRODUCTS)

  console.log('Seeding HPC items...')
  await supabase.from('hpc_items').insert(HPC_CHECKLIST_DEFAULT)

  console.log('✅ Seeding complete!')
}

seed().catch(console.error)
JS

node seed-supabase.js
```

## Step 5: Enable Dark Mode (Optional)

The dark mode hook is ready to use. Add to your Header component:

```tsx
import { useTheme } from './hooks/useTheme'
import { Moon, Sun } from 'lucide-react'

function Header() {
  const { isDark, toggleTheme } = useTheme()
  
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-slate-800"
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
```

## Step 6: Verify Everything Works

```bash
# 1. Build succeeds
npm run build

# 2. Tests pass
npm run test

# 3. Linting clean
npm run lint

# 4. Dev server works
npm run dev
# Visit http://localhost:3000 and test:
#   - Admin login (magic link)
#   - Dark mode toggle (if added)
#   - Content displays correctly

# 5. Docker builds
docker build -t ai-networking:latest .
docker run -p 8080:8080 ai-networking:latest
# Visit http://localhost:8080
```

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js @sentry/react
```

### "Missing Supabase environment variables"
- Check `.env.local` exists
- Has `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- Credentials match Supabase project

### "Authentication not working"
- Open browser DevTools → Console
- Check for errors from Supabase
- Verify magic link is being sent (check email inbox or spam)
- Test with direct Supabase auth: https://puktrjfoazyydypagvyj.supabase.co/auth/v1/callback

### "Tables not showing in Table Editor"
- Refresh Supabase dashboard
- Check SQL execution succeeded (should see "Query successful")
- Check for RLS policy errors (they prevent operations)

## Next Steps After Setup

1. **Test Admin Features**
   - Login with magic link
   - Edit glossary terms
   - Verify local runtime edits apply correctly in the browser
   - Defer shared-dataset sync verification until the sync wiring is added

2. **Monitor with Sentry** (Optional)
   - Create Sentry account: https://sentry.io
   - Get DSN and add to `.env.local`: `VITE_SENTRY_DSN=...`
   - Test by throwing an error in admin panel

3. **Deploy to Cloud Run**
   - Set up GitHub secrets (GCP credentials, Supabase keys)
   - Push to main branch
   - GitHub Actions will build and deploy automatically

4. **Plan Shared Sync Wiring**
   - Decide which admin-editable datasets must persist to Supabase
   - Wire `useSupabaseSync` into the authenticated admin flow
   - Add upload and realtime coverage for every chosen dataset

## Quick Commands Reference

```bash
# Development
npm run dev                 # Start dev server

# Building
npm run build             # Production build
npm run analyze           # Bundle analysis

# Testing
npm run test              # Unit tests
npx playwright install --with-deps chromium  # One-time browser install
npm run test:e2e         # E2E tests
npm run lint             # Code quality

# Docker
docker build -t ai-networking:latest .
docker run -p 8080:8080 ai-networking:latest

# Supabase
supabase projects list    # List projects
supabase db push         # Push migrations
```

---

**Status**: Ready to configure Supabase tables
**Time to completion**: ~15 minutes
**Support**: See IMPLEMENTATION_GUIDE.md for detailed docs
