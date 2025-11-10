#!/usr/bin/env tsx
/**
 * Database Backup Script
 * Creates a backup of the PostgreSQL database using pg_dump
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface BackupOptions {
  outputDir?: string;
  compress?: boolean;
  includeData?: boolean;
}

function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return dbUrl;
}

function parseConnectionString(url: string) {
  // Parse DATABASE_URL: postgresql://user:password@host:port/database
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5],
  };
}

async function createBackup(options: BackupOptions = {}) {
  console.log('\n💾 Database Backup Utility\n');

  const {
    outputDir = './backups',
    compress = true,
    includeData = true,
  } = options;

  try {
    // Ensure backup directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created backup directory: ${outputDir}`);
    }

    // Get database connection info
    const dbUrl = getDatabaseUrl();
    const conn = parseConnectionString(dbUrl);

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const extension = compress ? '.sql.gz' : '.sql';
    const filename = `backup_${conn.database}_${timestamp}${extension}`;
    const filepath = path.join(outputDir, filename);

    console.log('📊 Backup configuration:');
    console.log(`   - Database: ${conn.database}`);
    console.log(`   - Host: ${conn.host}:${conn.port}`);
    console.log(`   - Output: ${filepath}`);
    console.log(`   - Compress: ${compress}`);
    console.log(`   - Include data: ${includeData}`);

    // Build pg_dump command
    let command = `PGPASSWORD="${conn.password}" pg_dump -h ${conn.host} -p ${conn.port} -U ${conn.user} -d ${conn.database}`;

    if (!includeData) {
      command += ' --schema-only';
    }

    if (compress) {
      command += ` | gzip > ${filepath}`;
    } else {
      command += ` > ${filepath}`;
    }

    console.log('\n🔄 Creating backup...');
    execSync(command, { stdio: 'inherit' });

    // Get file size
    const stats = fs.statSync(filepath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\n✅ Backup completed successfully!');
    console.log(`📦 Backup file: ${filepath}`);
    console.log(`📏 File size: ${fileSizeMB} MB\n`);

    // List recent backups
    console.log('📚 Recent backups:');
    const backups = fs
      .readdirSync(outputDir)
      .filter((f) => f.startsWith('backup_'))
      .sort()
      .reverse()
      .slice(0, 5);

    backups.forEach((backup) => {
      const backupPath = path.join(outputDir, backup);
      const backupStats = fs.statSync(backupPath);
      const size = (backupStats.size / (1024 * 1024)).toFixed(2);
      console.log(`   - ${backup} (${size} MB)`);
    });

    console.log('\n💡 To restore from backup:');
    if (compress) {
      console.log(`   gunzip -c ${filepath} | psql -h ${conn.host} -p ${conn.port} -U ${conn.user} -d ${conn.database}`);
    } else {
      console.log(`   psql -h ${conn.host} -p ${conn.port} -U ${conn.user} -d ${conn.database} < ${filepath}`);
    }
    console.log();

  } catch (error) {
    console.error('\n❌ Backup failed:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: BackupOptions = {
  compress: !args.includes('--no-compress'),
  includeData: !args.includes('--schema-only'),
};

if (args.includes('--help')) {
  console.log(`
Database Backup Utility

Usage: npm run db:backup [options]

Options:
  --no-compress    Don't compress the backup file
  --schema-only    Backup schema only (no data)
  --help           Show this help message

Examples:
  npm run db:backup                    # Full compressed backup
  npm run db:backup -- --no-compress   # Full uncompressed backup
  npm run db:backup -- --schema-only   # Schema only backup
  `);
  process.exit(0);
}

createBackup(options);
