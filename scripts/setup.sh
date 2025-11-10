#!/bin/bash

# ============================================
# SSII IA Platform - Quick Setup Script
# ============================================
# This script automates the complete setup process

set -e  # Exit on error

echo "🚀 SSII IA Platform - Database Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# Check Prerequisites
# ============================================
echo "📋 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# ============================================
# Environment Setup
# ============================================
echo "🔧 Setting up environment..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env with your configuration${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists, skipping${NC}"
fi

echo ""

# ============================================
# Start Docker Services
# ============================================
echo "🐳 Starting Docker services..."

docker-compose down 2>/dev/null || true
docker-compose up -d

echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Wait for PostgreSQL to be healthy
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose exec -T postgres pg_isready -U ssii_user > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker services started${NC}"
echo ""

# ============================================
# Install Dependencies
# ============================================
echo "📦 Installing dependencies..."

cd packages/database
npm install

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# ============================================
# Generate Prisma Client
# ============================================
echo "🔨 Generating Prisma client..."

npx prisma generate

echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# ============================================
# Run Migrations
# ============================================
echo "🗄️  Running database migrations..."

npx prisma migrate dev --name init

echo -e "${GREEN}✅ Migrations completed${NC}"
echo ""

# ============================================
# Seed Database
# ============================================
echo "🌱 Seeding database..."

npx prisma db seed

echo -e "${GREEN}✅ Database seeded${NC}"
echo ""

# ============================================
# Health Check
# ============================================
echo "🏥 Running health check..."

npm run db:health

# ============================================
# Summary
# ============================================
echo ""
echo "=================================="
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo "=================================="
echo ""
echo "📊 Services:"
echo "   - PostgreSQL:  localhost:5432"
echo "   - Redis:       localhost:6379"
echo "   - pgAdmin:     http://localhost:5050"
echo ""
echo "🔐 pgAdmin Credentials:"
echo "   Email:    admin@ssii.com"
echo "   Password: admin"
echo ""
echo "👤 Test Users:"
echo "   Admin:     admin@ssii.com / admin123"
echo "   Test User: test@ssii.com / test123"
echo "   Developer: dev@ssii.com / dev123"
echo ""
echo "🚀 Next Steps:"
echo "   1. Open Prisma Studio: cd packages/database && npm run db:studio"
echo "   2. Open pgAdmin: http://localhost:5050"
echo "   3. Check logs: docker-compose logs -f"
echo ""
echo "📚 Documentation:"
echo "   - Main README: ./README.md"
echo "   - Database docs: ./packages/database/README.md"
echo ""
