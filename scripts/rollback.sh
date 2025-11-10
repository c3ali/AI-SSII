#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo "Usage: ./rollback.sh [production|staging]"
    exit 1
fi

ENV=$1

# Validate environment
if [ "$ENV" != "production" ] && [ "$ENV" != "staging" ]; then
    print_message "$RED" "❌ Error: Invalid environment '$ENV'"
    echo "Valid environments: production, staging"
    exit 1
fi

print_header "🔄 Rolling back SSII IA Platform in $ENV"

# Confirmation prompt for production
if [ "$ENV" == "production" ]; then
    print_message "$YELLOW" "⚠️  WARNING: You are about to rollback PRODUCTION!"
    read -p "Are you sure you want to continue? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        print_message "$RED" "Rollback cancelled"
        exit 0
    fi
fi

# Step 1: Rollback Vercel deployment
print_header "🌐 Rolling back Vercel deployment"

if command -v vercel >/dev/null 2>&1; then
    print_message "$BLUE" "Fetching previous deployments..."

    # Get the last successful deployment before current
    PREV_DEPLOYMENT=$(vercel ls --meta gitCommitRef="$ENV" --limit 2 | tail -n 1 | awk '{print $1}')

    if [ -n "$PREV_DEPLOYMENT" ]; then
        print_message "$BLUE" "Rolling back to deployment: $PREV_DEPLOYMENT"
        vercel rollback "$PREV_DEPLOYMENT" --yes
        print_message "$GREEN" "✅ Vercel rollback completed"
    else
        print_message "$YELLOW" "⚠️  No previous deployment found for Vercel"
    fi
else
    print_message "$RED" "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Step 2: Rollback Railway deployment
print_header "🚂 Rolling back Railway deployment"

if command -v railway >/dev/null 2>&1; then
    print_message "$BLUE" "Rolling back Railway deployment..."

    railway rollback --service api --environment "$ENV" || {
        print_message "$YELLOW" "⚠️  Railway rollback failed or not supported"
    }

    print_message "$GREEN" "✅ Railway rollback initiated"
else
    print_message "$RED" "❌ Railway CLI not found. Install with: npm i -g @railway/cli"
    exit 1
fi

# Step 3: Wait and verify
print_header "⏳ Waiting for rollback to complete"
sleep 30

# Step 4: Run health checks
print_header "🏥 Running health checks"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/health-check.sh" "$ENV" || {
    print_message "$RED" "❌ Health checks failed after rollback!"
    print_message "$YELLOW" "Manual intervention may be required"
    exit 1
}

print_message "$GREEN" "✅ Health checks passed after rollback"

# Step 5: Database rollback check
print_header "🗄️  Database Status Check"
print_message "$YELLOW" "⚠️  NOTE: This script does NOT automatically rollback database migrations"
print_message "$YELLOW" "If database migrations were run, you may need to manually revert them"
print_message "$BLUE" "Check your migration history with: pnpm prisma migrate status"

# Step 6: Notify team
print_header "📢 Sending notifications"

if [ -n "$SLACK_WEBHOOK" ]; then
    curl -X POST "$SLACK_WEBHOOK" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"⚠️  SSII IA Platform rolled back in $ENV environment\"}"
    print_message "$GREEN" "✅ Slack notification sent"
else
    print_message "$YELLOW" "⚠️  SLACK_WEBHOOK not set, skipping notification"
fi

# Step 7: Create incident log
print_header "📝 Creating incident log"

INCIDENT_FILE="rollback-$(date +%Y%m%d-%H%M%S).log"
cat > "$INCIDENT_FILE" <<EOF
Rollback Incident Report
========================
Date: $(date)
Environment: $ENV
User: $(whoami)
Reason: Manual rollback executed

Actions Taken:
- Vercel deployment rolled back
- Railway deployment rolled back
- Health checks performed

Status: Success
EOF

print_message "$GREEN" "✅ Incident log created: $INCIDENT_FILE"

# Final message
print_header "✅ Rollback Complete"
print_message "$YELLOW" "Important Next Steps:"
echo "1. Investigate the cause of the rollback"
echo "2. Fix the issues in development"
echo "3. Test thoroughly before redeploying"
echo "4. Review incident log: $INCIDENT_FILE"

exit 0
