#!/bin/bash

# Quick setup script - requires password as argument
# Usage: ./scripts/setup-database-quick.sh "your-password" "region"

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

SUPABASE_PROJECT_REF="vaxwew-saqjis-6hazsy"

if [ -z "$1" ]; then
    print_error "Password is required!"
    echo ""
    print_info "Usage: $0 \"password\" [region]"
    print_info "Example: $0 \"my-password-123\" \"us-east-1\""
    echo ""
    print_info "To get your password:"
    print_info "1. Go to: https://app.supabase.com/project/$SUPABASE_PROJECT_REF/settings/database"
    print_info "2. Find 'Database Password' section"
    print_info "3. Click 'Reset Database Password' if needed"
    exit 1
fi

DB_PASSWORD="$1"
REGION="${2:-us-east-1}"

print_info "Setting up DATABASE_URL for project: $SUPABASE_PROJECT_REF"
print_info "Using region: $REGION"

# Construct DATABASE_URL (using pooler - recommended)
DATABASE_URL="postgresql://postgres.${SUPABASE_PROJECT_REF}:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres"

print_info "Adding DATABASE_URL to Vercel..."

# Add to all environments
echo "$DATABASE_URL" | vercel env add DATABASE_URL production
echo "$DATABASE_URL" | vercel env add DATABASE_URL preview  
echo "$DATABASE_URL" | vercel env add DATABASE_URL development

print_success "DATABASE_URL added to all environments!"
print_info "Next: Redeploy with 'vercel --prod'"

