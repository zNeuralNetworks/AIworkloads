#!/bin/bash

# Supabase Setup Script
# This script sets up all required tables and policies in Supabase

set -e

SUPABASE_URL="${VITE_SUPABASE_URL:-https://puktrjfoazyydypagvyj.supabase.co}"
SUPABASE_KEY="${VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY:-sb_publishable_gBEp_3g8ZjgxJXI_BgjkWA_i8RlNUrW}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables required"
    echo "Set them in .env.local and try again"
    exit 1
fi

echo "🔧 Supabase Setup Script"
echo "========================"
echo "Project URL: $SUPABASE_URL"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Install with:"
    echo "   brew install supabase/tap/supabase"
    echo ""
    echo "Alternatively, run SQL migration manually:"
    echo "  1. Go to: $SUPABASE_URL/project/sql"
    echo "  2. Paste contents of: supabase/migrations/001_init_tables.sql"
    echo "  3. Click 'Run'"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# List available projects
echo "📋 Available Supabase projects:"
supabase projects list

echo ""
echo "Next steps:"
echo "1. Visit Supabase dashboard: $SUPABASE_URL"
echo "2. Navigate to SQL Editor"
echo "3. Create new query and paste contents of: supabase/migrations/001_init_tables.sql"
echo "4. Execute the migration"
echo "5. Verify tables created: Navigate to Table Editor"
