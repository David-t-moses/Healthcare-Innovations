#!/usr/bin/env node

/**
 * Migration script to finalize Neon DB setup
 * Run this after setting up your Neon database connection
 */

const { execSync } = require('child_process');

console.log('🚀 Starting Neon DB migration...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push schema to database
  console.log('🔄 Pushing schema to Neon database...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('✅ Migration completed successfully!');
  console.log('🎉 Your app is now using Neon DB with Prisma');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}