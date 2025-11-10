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

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=${RETENTION_DAYS:-30}

print_header "💾 Starting backup process"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
print_message "$GREEN" "✅ Backup directory: $BACKUP_DIR"

# Step 1: Database Backup
print_header "🗄️  Backing up database"

if [ -z "$DATABASE_URL" ]; then
    print_message "$RED" "❌ DATABASE_URL not set"
    exit 1
fi

# Parse database URL
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\).*/\1/p')

DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

print_message "$BLUE" "Creating database dump..."

# Use pg_dump to create backup
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$DB_BACKUP_FILE"

# Compress the backup
gzip "$DB_BACKUP_FILE"
DB_BACKUP_FILE="${DB_BACKUP_FILE}.gz"

print_message "$GREEN" "✅ Database backup created: $DB_BACKUP_FILE"

# Get backup size
BACKUP_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
print_message "$BLUE" "Backup size: $BACKUP_SIZE"

# Step 2: Application Code Backup (Git)
print_header "📦 Backing up application code"

CODE_BACKUP_FILE="$BACKUP_DIR/code_backup_$TIMESTAMP.tar.gz"

# Get current git commit
GIT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# Create tarball of current codebase
tar -czf "$CODE_BACKUP_FILE" \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=dist \
    --exclude=build \
    --exclude=.git \
    --exclude=backups \
    . 2>/dev/null || true

print_message "$GREEN" "✅ Code backup created: $CODE_BACKUP_FILE"
print_message "$BLUE" "Git commit: $GIT_COMMIT"
print_message "$BLUE" "Git branch: $GIT_BRANCH"

# Step 3: Configuration Backup
print_header "⚙️  Backing up configurations"

CONFIG_BACKUP_FILE="$BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz"

# Backup configuration files (excluding secrets)
tar -czf "$CONFIG_BACKUP_FILE" \
    .github \
    infra \
    scripts \
    *.config.js \
    *.config.ts \
    tsconfig.json \
    package.json \
    turbo.json 2>/dev/null || true

print_message "$GREEN" "✅ Configuration backup created: $CONFIG_BACKUP_FILE"

# Step 4: Environment Variables Backup (encrypted)
print_header "🔐 Backing up environment variables"

if [ -f .env.production ]; then
    ENV_BACKUP_FILE="$BACKUP_DIR/env_backup_$TIMESTAMP.enc"

    # Encrypt .env file if encryption key is available
    if [ -n "$BACKUP_ENCRYPTION_KEY" ]; then
        openssl enc -aes-256-cbc -salt -in .env.production -out "$ENV_BACKUP_FILE" -k "$BACKUP_ENCRYPTION_KEY"
        print_message "$GREEN" "✅ Environment variables backup created (encrypted): $ENV_BACKUP_FILE"
    else
        print_message "$YELLOW" "⚠️  BACKUP_ENCRYPTION_KEY not set, skipping .env backup for security"
    fi
else
    print_message "$YELLOW" "⚠️  .env.production not found, skipping"
fi

# Step 5: Create backup manifest
print_header "📋 Creating backup manifest"

MANIFEST_FILE="$BACKUP_DIR/manifest_$TIMESTAMP.json"

cat > "$MANIFEST_FILE" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_commit": "$GIT_COMMIT",
  "git_branch": "$GIT_BRANCH",
  "database_backup": "$DB_BACKUP_FILE",
  "code_backup": "$CODE_BACKUP_FILE",
  "config_backup": "$CONFIG_BACKUP_FILE",
  "backup_size": "$BACKUP_SIZE",
  "hostname": "$(hostname)",
  "user": "$(whoami)"
}
EOF

print_message "$GREEN" "✅ Backup manifest created: $MANIFEST_FILE"

# Step 6: Upload to cloud storage (optional)
if [ -n "$S3_BUCKET" ] && command -v aws >/dev/null 2>&1; then
    print_header "☁️  Uploading to S3"

    aws s3 cp "$DB_BACKUP_FILE" "s3://$S3_BUCKET/backups/$(basename $DB_BACKUP_FILE)"
    aws s3 cp "$CODE_BACKUP_FILE" "s3://$S3_BUCKET/backups/$(basename $CODE_BACKUP_FILE)"
    aws s3 cp "$CONFIG_BACKUP_FILE" "s3://$S3_BUCKET/backups/$(basename $CONFIG_BACKUP_FILE)"
    aws s3 cp "$MANIFEST_FILE" "s3://$S3_BUCKET/backups/$(basename $MANIFEST_FILE)"

    print_message "$GREEN" "✅ Backups uploaded to S3: s3://$S3_BUCKET/backups/"
else
    print_message "$YELLOW" "⚠️  S3_BUCKET not set or AWS CLI not available, skipping cloud upload"
fi

# Step 7: Clean up old backups
print_header "🧹 Cleaning up old backups"

find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.enc" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.json" -mtime +$RETENTION_DAYS -delete

print_message "$GREEN" "✅ Removed backups older than $RETENTION_DAYS days"

# Step 8: Verify backups
print_header "✅ Verifying backups"

# Check if backup files exist and are not empty
for file in "$DB_BACKUP_FILE" "$CODE_BACKUP_FILE" "$CONFIG_BACKUP_FILE"; do
    if [ -f "$file" ] && [ -s "$file" ]; then
        print_message "$GREEN" "✅ $(basename $file) is valid"
    else
        print_message "$RED" "❌ $(basename $file) is missing or empty!"
        exit 1
    fi
done

# Final summary
print_header "🎉 Backup Complete!"

echo "Backup Summary:"
echo "- Database: $DB_BACKUP_FILE ($BACKUP_SIZE)"
echo "- Code: $CODE_BACKUP_FILE"
echo "- Config: $CONFIG_BACKUP_FILE"
echo "- Manifest: $MANIFEST_FILE"
echo ""
echo "Retention: Backups older than $RETENTION_DAYS days are automatically removed"

# Create restore instructions
cat > "$BACKUP_DIR/RESTORE_INSTRUCTIONS.md" <<'EOF'
# Restore Instructions

## Database Restore

```bash
# Decompress backup
gunzip db_backup_TIMESTAMP.sql.gz

# Restore to PostgreSQL
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME < db_backup_TIMESTAMP.sql
```

## Code Restore

```bash
# Extract code backup
tar -xzf code_backup_TIMESTAMP.tar.gz -C /path/to/restore

# Install dependencies
cd /path/to/restore
pnpm install

# Build
pnpm build
```

## Environment Variables Restore

```bash
# Decrypt .env file
openssl enc -aes-256-cbc -d -in env_backup_TIMESTAMP.enc -out .env.production -k $BACKUP_ENCRYPTION_KEY
```

## Configuration Restore

```bash
# Extract config backup
tar -xzf config_backup_TIMESTAMP.tar.gz
```
EOF

print_message "$BLUE" "📖 Restore instructions saved: $BACKUP_DIR/RESTORE_INSTRUCTIONS.md"

exit 0
