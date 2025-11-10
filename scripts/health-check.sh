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

# Check if environment is provided
ENV=${1:-production}

# Environment-specific URLs
case $ENV in
    production)
        WEB_URL="https://ssii-ia.vercel.app"
        API_URL="https://api.ssii-ia.railway.app"
        ;;
    staging)
        WEB_URL="https://staging.ssii-ia.vercel.app"
        API_URL="https://api-staging.ssii-ia.railway.app"
        ;;
    preview)
        WEB_URL="https://preview.ssii-ia.vercel.app"
        API_URL="https://api-preview.ssii-ia.railway.app"
        ;;
    *)
        print_message "$RED" "Unknown environment: $ENV"
        exit 1
        ;;
esac

print_message "$BLUE" "🏥 Running health checks for $ENV environment..."
echo ""

# Track overall health
ALL_HEALTHY=true

# Function to check endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    local max_retries=3
    local retry_delay=5

    print_message "$BLUE" "Checking $name..."

    for i in $(seq 1 $max_retries); do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

        if [ "$response" == "$expected_status" ]; then
            print_message "$GREEN" "✅ $name is healthy (HTTP $response)"
            return 0
        else
            if [ $i -lt $max_retries ]; then
                print_message "$YELLOW" "⏳ Retry $i/$max_retries for $name (got HTTP $response)..."
                sleep $retry_delay
            fi
        fi
    done

    print_message "$RED" "❌ $name health check failed (HTTP $response)"
    ALL_HEALTHY=false
    return 1
}

# Function to check response time
check_response_time() {
    local name=$1
    local url=$2
    local max_time=3  # seconds

    print_message "$BLUE" "Checking $name response time..."

    response_time=$(curl -o /dev/null -s -w "%{time_total}" "$url" 2>/dev/null || echo "999")

    if (( $(echo "$response_time < $max_time" | bc -l) )); then
        print_message "$GREEN" "✅ $name response time: ${response_time}s (threshold: ${max_time}s)"
    else
        print_message "$YELLOW" "⚠️  $name response time is slow: ${response_time}s (threshold: ${max_time}s)"
    fi
}

# Function to check SSL certificate
check_ssl() {
    local url=$1
    local domain=$(echo "$url" | sed -e 's|^https://||' -e 's|/.*||')

    print_message "$BLUE" "Checking SSL certificate for $domain..."

    expiry=$(echo | openssl s_client -servername "$domain" -connect "$domain":443 2>/dev/null | \
             openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)

    if [ -n "$expiry" ]; then
        expiry_epoch=$(date -d "$expiry" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$expiry" +%s 2>/dev/null)
        current_epoch=$(date +%s)
        days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))

        if [ $days_until_expiry -gt 30 ]; then
            print_message "$GREEN" "✅ SSL certificate valid for $days_until_expiry days"
        elif [ $days_until_expiry -gt 7 ]; then
            print_message "$YELLOW" "⚠️  SSL certificate expires in $days_until_expiry days"
        else
            print_message "$RED" "❌ SSL certificate expires in $days_until_expiry days!"
            ALL_HEALTHY=false
        fi
    else
        print_message "$YELLOW" "⚠️  Could not verify SSL certificate"
    fi
}

# 1. Check Web Application
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_message "$BLUE" "🌐 Web Application Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_endpoint "Web Homepage" "$WEB_URL"
check_endpoint "Web Health Endpoint" "$WEB_URL/api/health"
check_response_time "Web Application" "$WEB_URL"

if [[ $WEB_URL == https://* ]]; then
    check_ssl "$WEB_URL"
fi

# 2. Check API
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_message "$BLUE" "🔧 API Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_endpoint "API Health" "$API_URL/health"
check_endpoint "API Root" "$API_URL/" 200
check_response_time "API" "$API_URL/health"

if [[ $API_URL == https://* ]]; then
    check_ssl "$API_URL"
fi

# 3. Check specific API endpoints
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_message "$BLUE" "📡 API Endpoint Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_endpoint "Projects API" "$API_URL/api/v1/projects" 200
check_endpoint "Users API" "$API_URL/api/v1/users" 401  # Expect auth required

# 4. Database connectivity (via API)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_message "$BLUE" "🗄️  Database Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_endpoint "Database Health" "$API_URL/health/db"

# 5. Check metrics endpoint
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_message "$BLUE" "📊 Monitoring & Metrics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_endpoint "Metrics Endpoint" "$API_URL/metrics" 200

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_message "$BLUE" "📋 Health Check Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$ALL_HEALTHY" = true ]; then
    print_message "$GREEN" "✅ All health checks passed!"
    print_message "$GREEN" "System is healthy in $ENV environment"
    exit 0
else
    print_message "$RED" "❌ Some health checks failed!"
    print_message "$RED" "System has issues in $ENV environment"
    exit 1
fi
