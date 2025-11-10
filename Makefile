.PHONY: help setup start stop restart logs clean reset backup health studio

# Default target
help:
	@echo "SSII IA Platform - Database Layer"
	@echo "=================================="
	@echo ""
	@echo "Available commands:"
	@echo ""
	@echo "  Setup & Installation:"
	@echo "    make setup          - Complete initial setup"
	@echo "    make install        - Install dependencies only"
	@echo ""
	@echo "  Docker Services:"
	@echo "    make start          - Start all services"
	@echo "    make stop           - Stop all services"
	@echo "    make restart        - Restart all services"
	@echo "    make logs           - View service logs"
	@echo ""
	@echo "  Database Operations:"
	@echo "    make migrate        - Run migrations"
	@echo "    make seed           - Seed database"
	@echo "    make reset          - Reset database"
	@echo "    make backup         - Create database backup"
	@echo "    make studio         - Open Prisma Studio"
	@echo ""
	@echo "  Monitoring:"
	@echo "    make health         - Run health check"
	@echo "    make status         - Check service status"
	@echo ""
	@echo "  Cleanup:"
	@echo "    make clean          - Remove generated files"
	@echo "    make clean-all      - Remove all data (dangerous!)"
	@echo ""

# ============================================
# Setup & Installation
# ============================================

setup:
	@echo "🚀 Running complete setup..."
	@bash scripts/setup.sh

install:
	@echo "📦 Installing dependencies..."
	@cd packages/database && npm install

# ============================================
# Docker Services
# ============================================

start:
	@echo "🐳 Starting Docker services..."
	@docker-compose up -d
	@echo "✅ Services started"
	@make status

stop:
	@echo "🛑 Stopping Docker services..."
	@docker-compose down
	@echo "✅ Services stopped"

restart:
	@echo "🔄 Restarting Docker services..."
	@docker-compose restart
	@echo "✅ Services restarted"

logs:
	@echo "📋 Viewing logs (Ctrl+C to exit)..."
	@docker-compose logs -f

status:
	@echo "📊 Service Status:"
	@docker-compose ps

# ============================================
# Database Operations
# ============================================

migrate:
	@echo "🗄️  Running migrations..."
	@cd packages/database && npx prisma migrate dev

migrate-prod:
	@echo "🗄️  Running production migrations..."
	@cd packages/database && npx prisma migrate deploy

seed:
	@echo "🌱 Seeding database..."
	@cd packages/database && npm run db:seed

reset:
	@echo "⚠️  Resetting database..."
	@cd packages/database && npm run db:reset

backup:
	@echo "💾 Creating backup..."
	@cd packages/database && npm run db:backup

studio:
	@echo "🎨 Opening Prisma Studio..."
	@cd packages/database && npm run db:studio

# ============================================
# Monitoring
# ============================================

health:
	@echo "🏥 Running health check..."
	@cd packages/database && npm run db:health

# ============================================
# Cleanup
# ============================================

clean:
	@echo "🧹 Cleaning generated files..."
	@rm -rf packages/database/dist
	@rm -rf packages/database/node_modules/.prisma
	@echo "✅ Cleanup complete"

clean-all:
	@echo "⚠️  WARNING: This will delete ALL data!"
	@read -p "Are you sure? (yes/no): " confirm && [ "$$confirm" = "yes" ] || exit 1
	@docker-compose down -v
	@rm -rf backups
	@echo "✅ All data removed"

# ============================================
# Development
# ============================================

dev:
	@echo "🔨 Starting development mode..."
	@cd packages/database && npm run dev

build:
	@echo "🏗️  Building package..."
	@cd packages/database && npm run build

# ============================================
# Testing
# ============================================

test-connection:
	@echo "🔌 Testing database connection..."
	@docker-compose exec postgres pg_isready -U ssii_user

test-redis:
	@echo "🔌 Testing Redis connection..."
	@docker-compose exec redis redis-cli ping
