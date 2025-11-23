#!/bin/bash

# BrainPlay Kids - Vercel Deployment Script
# Usage: ./scripts/deploy-vercel.sh [environment] [--skip-build] [--skip-checks]
# Environment: production (default) or preview
# Options:
#   --skip-build: Skip build step (useful for quick redeployments)
#   --skip-checks: Skip environment variable checks

set -e

ENVIRONMENT=${1:-production}
SKIP_BUILD=false
SKIP_CHECKS=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-checks)
            SKIP_CHECKS=true
            shift
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Start deployment
print_header "🚀 BrainPlay Kids - Vercel Deployment"
print_info "Environment: $ENVIRONMENT"
print_info "Skip Build: $SKIP_BUILD"
print_info "Skip Checks: $SKIP_CHECKS"

# Check if Vercel CLI is installed
print_header "📦 Checking Prerequisites"

if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI is not installed. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed"
else
    VERCEL_VERSION=$(vercel --version 2>/dev/null || echo "unknown")
    print_success "Vercel CLI found (version: $VERCEL_VERSION)"
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

# Link project if not already linked
if [ ! -f ".vercel/project.json" ]; then
    print_warning "Project not linked to Vercel. Linking..."
    vercel link
    print_success "Project linked to Vercel"
else
    print_success "Project already linked to Vercel"
fi

# Environment variable checks
if [ "$SKIP_CHECKS" = false ]; then
    print_header "🔍 Checking Environment Variables"
    
    REQUIRED_VARS=(
        "DATABASE_URL"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "GEMINI_API_KEY"
    )
    
    OPTIONAL_VARS=(
        "REDIS_URL"
        "NEXT_PUBLIC_APP_URL"
        "NEXT_PUBLIC_DOMAIN"
    )
    
    MISSING_VARS=()
    
    # Check required variables
    for var in "${REQUIRED_VARS[@]}"; do
        if vercel env ls "$var" "$ENVIRONMENT" 2>/dev/null | grep -q "$var"; then
            print_success "$var is set"
        else
            print_error "$var is missing"
            MISSING_VARS+=("$var")
        fi
    done
    
    # Check optional variables
    for var in "${OPTIONAL_VARS[@]}"; do
        if vercel env ls "$var" "$ENVIRONMENT" 2>/dev/null | grep -q "$var"; then
            print_success "$var is set (optional)"
        else
            print_warning "$var is not set (optional)"
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        print_error "Missing required environment variables: ${MISSING_VARS[*]}"
        print_info "Set them using: vercel env add <VAR_NAME> $ENVIRONMENT"
        print_warning "Continuing anyway... (use --skip-checks to suppress this)"
    fi
fi

# Generate Prisma Client
print_header "📦 Generating Prisma Client"
if npx prisma generate; then
    print_success "Prisma Client generated"
else
    print_error "Failed to generate Prisma Client"
    exit 1
fi

# Build project
if [ "$SKIP_BUILD" = false ]; then
    print_header "🔨 Building Project"
    if npm run build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
else
    print_warning "Skipping build step"
fi

# Deploy to Vercel
print_header "🚀 Deploying to Vercel"

DEPLOY_OUTPUT=""
if [ "$ENVIRONMENT" = "production" ]; then
    print_info "Deploying to production..."
    if DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1); then
        print_success "Deployment to production completed!"
    else
        print_error "Deployment failed"
        echo "$DEPLOY_OUTPUT"
        exit 1
    fi
else
    print_info "Deploying preview..."
    if DEPLOY_OUTPUT=$(vercel --yes 2>&1); then
        print_success "Preview deployment completed!"
    else
        print_error "Deployment failed"
        echo "$DEPLOY_OUTPUT"
        exit 1
    fi
fi

# Extract deployment URL from output
DEPLOYMENT_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[^[:space:]]+\.vercel\.app' | head -1 || echo "")

# Final summary
print_header "✅ Deployment Summary"
print_success "Deployment completed successfully!"
if [ -n "$DEPLOYMENT_URL" ]; then
    print_info "Deployment URL: $DEPLOYMENT_URL"
fi
print_info "Environment: $ENVIRONMENT"

if [ "$ENVIRONMENT" = "production" ]; then
    print_info "View deployment: https://vercel.com/dashboard"
else
    print_info "This is a preview deployment"
fi

print_warning "Remember to verify environment variables in Vercel Dashboard"
print_warning "Test the deployment URL to ensure everything works correctly"

echo ""

