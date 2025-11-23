#!/bin/bash

# Auto-setup DATABASE_URL in Vercel
# This script tries to automatically get database connection info and set it up

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

SUPABASE_PROJECT_REF="vaxwew-saqjis-6hazsy"

print_info "Attempting to get database connection from Supabase..."

# Try to use Supabase CLI if available
if command -v supabase &> /dev/null; then
    print_info "Supabase CLI found, trying to get connection string..."
    # This would require Supabase CLI to be linked
    # For now, we'll use the manual method
fi

# Since we can't automatically get the password, we'll use the most common setup
print_warning "Cannot automatically retrieve database password (security requirement)"
print_info "You need to provide the database password"
print_info ""
print_info "Quick setup options:"
print_info "1. Run: ./scripts/setup-vercel-database.sh [password] [region]"
print_info "2. Or get password from: https://app.supabase.com/project/$SUPABASE_PROJECT_REF/settings/database"
print_info ""
print_info "Most common region is: us-east-1"
print_info ""
print_info "Example command:"
print_info "./scripts/setup-vercel-database.sh 'your-password' 'us-east-1'"

