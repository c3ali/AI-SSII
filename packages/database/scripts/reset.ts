#!/usr/bin/env tsx
/**
 * Database Reset Script
 * Drops all data and re-seeds the database
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as readline from 'readline';

const prisma = new PrismaClient();

async function confirmReset(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '⚠️  This will DELETE ALL DATA in the database. Are you sure? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

async function resetDatabase() {
  console.log('\n🔄 Database Reset Utility\n');

  // Confirmation in production
  if (process.env.NODE_ENV === 'production') {
    const confirmed = await confirmReset();
    if (!confirmed) {
      console.log('❌ Reset cancelled');
      process.exit(0);
    }
  }

  try {
    console.log('📊 Checking current database state...');
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Projects: ${projectCount}`);

    console.log('\n🗑️  Deleting all data...');

    // Delete in order to respect foreign key constraints
    await prisma.file.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.metrics.deleteMany();
    await prisma.execution.deleteMany();
    await prisma.template.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ All data deleted');

    console.log('\n🔄 Resetting sequences...');
    await prisma.$executeRawUnsafe('ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1');
    await prisma.$executeRawUnsafe('ALTER SEQUENCE IF EXISTS projects_id_seq RESTART WITH 1');

    console.log('✅ Sequences reset');

    console.log('\n🌱 Re-seeding database...');
    execSync('npm run db:seed', { stdio: 'inherit' });

    console.log('\n✅ Database reset completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Reset failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
