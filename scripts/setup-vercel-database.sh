#!/bin/bash

# Script to setup DATABASE_URL in Vercel
# This script helps you add DATABASE_URL environment variable to Vercel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Supabase project details
SUPABASE_PROJECT_REF="vaxwew-saqjis-6hazsy"
SUPABASE_URL="https://${SUPABASE_PROJECT_REF}.supabase.co"

print_header "🔧 Vercel DATABASE_URL Setup"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed!"
    print_info "Install it with: npm i -g vercel"
    exit 1
fi

# Check if logged in
print_info "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please login..."
    vercel login
    print_success "Logged in to Vercel"
else
    USER_EMAIL=$(vercel whoami 2>/dev/null || echo "unknown")
    print_success "Authenticated as: $USER_EMAIL"
fi

# Check if project is linked
if [ ! -f ".vercel/project.json" ]; then
    print_warning "Project not linked to Vercel. Linking..."
    vercel link --yes
    print_success "Project linked to Vercel"
else
    print_success "Project already linked to Vercel"
fi

print_header "📋 Supabase Database Information"

print_info "Supabase Project: $SUPABASE_PROJECT_REF"
print_info "Supabase URL: $SUPABASE_URL"

# Check if password is provided as argument
if [ -n "$1" ]; then
    DB_PASSWORD="$1"
    print_info "Using password from argument"
else
    print_warning "You need to get your Database Password from Supabase Dashboard"
    print_info "1. Go to: https://app.supabase.com/project/$SUPABASE_PROJECT_REF/settings/database"
    print_info "2. Find 'Database Password' section"
    print_info "3. If you don't know it, click 'Reset Database Password'"
    print_info "4. Copy the password"
    
    echo ""
    read -sp "Enter your Supabase Database Password: " DB_PASSWORD
    echo ""
    
    if [ -z "$DB_PASSWORD" ]; then
        print_error "Password cannot be empty!"
        print_info "Usage: $0 [password] [region]"
        exit 1
    fi
fi

# Check if region is provided as argument
if [ -n "$2" ]; then
    REGION="$2"
    print_info "Using region from argument: $REGION"
else
    print_info "Getting region information..."
    print_warning "If you don't know the region, we'll try common ones"
    
    # Try to get region from Supabase (common regions)
    REGIONS=("us-east-1" "eu-west-1" "ap-southeast-1" "us-west-1" "eu-central-1")
    
    echo ""
    print_info "Select your Supabase region (or press Enter for us-east-1):"
    echo "1) us-east-1 (US East)"
    echo "2) eu-west-1 (EU West)"
    echo "3) ap-southeast-1 (Asia Pacific)"
    echo "4) us-west-1 (US West)"
    echo "5) eu-central-1 (EU Central)"
    echo "6) Enter custom region"
    read -p "Choice [1-6] (default: 1): " REGION_CHOICE
    
    case $REGION_CHOICE in
        1) REGION="us-east-1" ;;
        2) REGION="eu-west-1" ;;
        3) REGION="ap-southeast-1" ;;
        4) REGION="us-west-1" ;;
        5) REGION="eu-central-1" ;;
        6) 
            read -p "Enter custom region: " REGION
            if [ -z "$REGION" ]; then
                REGION="us-east-1"
            fi
            ;;
        *) REGION="us-east-1" ;;
    esac
    
    print_info "Using region: $REGION"
fi

# Construct DATABASE_URL
# Option 1: Pooler connection (recommended for production)
DATABASE_URL_POOLER="postgresql://postgres.${SUPABASE_PROJECT_REF}:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres"

# Option 2: Direct connection (fallback)
DATABASE_URL_DIRECT="postgresql://postgres.${SUPABASE_PROJECT_REF}:${DB_PASSWORD}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres"

print_header "🔗 Setting up DATABASE_URL"

echo ""
print_info "Choose connection type:"
echo "1) Pooler connection (recommended for production) - Port 6543"
echo "2) Direct connection - Port 5432"
read -p "Choice [1-2] (default: 1): " CONNECTION_CHOICE

if [ "$CONNECTION_CHOICE" = "2" ]; then
    DATABASE_URL="$DATABASE_URL_DIRECT"
    print_info "Using direct connection"
else
    DATABASE_URL="$DATABASE_URL_POOLER"
    print_info "Using pooler connection (recommended)"
fi

print_info "DATABASE_URL will be set to:"
echo -e "${YELLOW}${DATABASE_URL}${NC}"
echo ""

read -p "Continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    print_warning "Cancelled"
    exit 0
fi

print_header "📤 Adding DATABASE_URL to Vercel"

# Add to Production
print_info "Adding to Production environment..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL production

# Add to Preview
print_info "Adding to Preview environment..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL preview

# Add to Development
print_info "Adding to Development environment..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL development

print_success "DATABASE_URL added to all environments!"

print_header "✅ Setup Complete"

print_success "DATABASE_URL has been added to Vercel!"
print_info "Next steps:"
echo "1. Redeploy your application: vercel --prod"
echo "2. Test the connection: https://brainplaykids.com/api/health/db"
echo "3. Try admin login: https://brainplaykids.com/admin/login"

echo ""
print_info "To verify, run: vercel env ls"

