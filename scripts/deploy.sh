#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Print section header
print_header() {
    echo ""
    echo "========================================"
    print_message "$BLUE" "$1"
    echo "========================================"
}

# Check if environment is provided
if [ -z "$1" ]; then
    print_message "$RED" "❌ Error: Environment not specified"
    echo "Usage: ./deploy.sh [production|staging|preview]"
    exit 1
fi

ENV=$1

# Validate environment
if [ "$ENV" != "production" ] && [ "$ENV" != "staging" ] && [ "$ENV" != "preview" ]; then
    print_message "$RED" "❌ Error: Invalid environment '$ENV'"
    echo "Valid environments: production, staging, preview"
    exit 1
fi

print_header "🚀 Deploying SSII IA Platform to $ENV"

# Step 1: Pre-deployment checks
print_header "📋 Running pre-deployment checks"

# Check if git is clean (for production only)
if [ "$ENV" == "production" ]; then
    if ! git diff-index --quiet HEAD --; then
        print_message "$RED" "❌ Error: Git working directory is not clean"
        print_message "$YELLOW" "Please commit or stash your changes before deploying to production"
        exit 1
    fi
    print_message "$GREEN" "✅ Git working directory is clean"
fi

# Check for required dependencies
command -v node >/dev/null 2>&1 || { print_message "$RED" "❌ Error: Node.js is required but not installed."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { print_message "$RED" "❌ Error: pnpm is required but not installed."; exit 1; }

print_message "$GREEN" "✅ All dependencies are available"

# Step 2: Install dependencies
print_header "📦 Installing dependencies"
cd "$PROJECT_ROOT"
pnpm install --frozen-lockfile
print_message "$GREEN" "✅ Dependencies installed"

# Step 3: Run tests
print_header "🧪 Running tests"
if [ "$ENV" == "production" ]; then
    pnpm test:ci || {
        print_message "$RED" "❌ Tests failed! Aborting deployment."
        exit 1
    }
    print_message "$GREEN" "✅ All tests passed"
else
    print_message "$YELLOW" "⏭️  Skipping tests for $ENV environment"
fi

# Step 4: Build application
print_header "🔨 Building application"
pnpm build
print_message "$GREEN" "✅ Build completed successfully"

# Step 5: Run security checks
if [ "$ENV" == "production" ]; then
    print_header "🔒 Running security checks"
    pnpm audit --production || {
        print_message "$YELLOW" "⚠️  Security vulnerabilities detected. Review and fix before deploying."
    }
fi

# Step 6: Deploy to platform
print_header "🌐 Deploying to $ENV"

case $ENV in
    production)
        # Deploy frontend to Vercel
        print_message "$BLUE" "Deploying frontend to Vercel..."
        vercel --prod --yes || {
            print_message "$RED" "❌ Vercel deployment failed"
            exit 1
        }

        # Deploy API to Railway
        print_message "$BLUE" "Deploying API to Railway..."
        railway up --environment production --service api || {
            print_message "$RED" "❌ Railway deployment failed"
            exit 1
        }
        ;;

    staging)
        print_message "$BLUE" "Deploying frontend to Vercel (staging)..."
        vercel --yes || {
            print_message "$RED" "❌ Vercel staging deployment failed"
            exit 1
        }

        print_message "$BLUE" "Deploying API to Railway (staging)..."
        railway up --environment staging --service api || {
            print_message "$RED" "❌ Railway staging deployment failed"
            exit 1
        }
        ;;

    preview)
        print_message "$BLUE" "Deploying preview environment..."
        vercel --yes
        railway up --environment preview --service api
        ;;
esac

print_message "$GREEN" "✅ Deployment to $ENV completed"

# Step 7: Run post-deployment health checks
print_header "🏥 Running health checks"
sleep 30  # Wait for deployment to stabilize

"$SCRIPT_DIR/health-check.sh" "$ENV" || {
    print_message "$RED" "❌ Health checks failed!"
    print_message "$YELLOW" "⚠️  Consider running rollback: ./scripts/rollback.sh $ENV"
    exit 1
}

print_message "$GREEN" "✅ All health checks passed"

# Step 8: Tag release (production only)
if [ "$ENV" == "production" ]; then
    print_header "🏷️  Tagging release"

    # Get current version from package.json
    VERSION=$(node -p "require('./package.json').version")
    TAG="v$VERSION"

    if git rev-parse "$TAG" >/dev/null 2>&1; then
        print_message "$YELLOW" "⚠️  Tag $TAG already exists"
    else
        git tag -a "$TAG" -m "Release $TAG"
        git push origin "$TAG"
        print_message "$GREEN" "✅ Tagged release as $TAG"
    fi
fi

# Step 9: Notify team
print_header "📢 Sending notifications"

if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST "$SLACK_WEBHOOK" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"✅ SSII IA Platform successfully deployed to $ENV\"}"
    print_message "$GREEN" "✅ Slack notification sent"
else
    print_message "$YELLOW" "⚠️  SLACK_WEBHOOK not set, skipping notification"
fi

# Final message
print_header "🎉 Deployment Complete!"
print_message "$GREEN" "Environment: $ENV"
print_message "$GREEN" "Time: $(date)"

if [ "$ENV" == "production" ]; then
    print_message "$BLUE" "🌐 Production URL: https://ssii-ia.vercel.app"
    print_message "$BLUE" "🔧 API URL: https://api.ssii-ia.railway.app"
fi

exit 0
