import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.development
const envPath = path.resolve(process.cwd(), '.env.development');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env.development file not found!');
  console.error(
    '   Please copy .env.development from the template and update with your Neon credentials.'
  );
  process.exit(1);
}

// Load env vars from file into a config object to merge with process.env
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const env = { ...process.env, ...envConfig };

console.log('🚀 Starting Acquisition App in Development Mode');
console.log('================================================');

// Check Neon keys
if (!env.NEON_API_KEY || !env.NEON_PROJECT_ID) {
  console.warn(
    '⚠️ Warning: NEON_API_KEY or NEON_PROJECT_ID are missing in .env.development.'
  );
  console.warn('   Neon Local needs these to create branches.');
}

// Ensure .neon_local directory exists
const neonLocalDir = path.join(process.cwd(), '.neon_local');
if (!fs.existsSync(neonLocalDir)) {
  fs.mkdirSync(neonLocalDir, { recursive: true });
}

// Check docker
const dockerCheck = spawnSync('docker', ['info'], { stdio: 'ignore' });
if (dockerCheck.error || dockerCheck.status !== 0) {
  console.error('❌ Error: Docker is not running!');
  console.error('   Please start Docker Desktop and try again.');
  process.exit(1);
}

console.log('📦 Starting Neon Local...');

// Helper to run commands with the loaded environment
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    env, // Important: Pass the loaded env vars
    ...options,
  });
  if (result.status !== 0 && !options.ignoreError) {
    console.error(`❌ Command failed: ${command} ${args.join(' ')}`);
    process.exit(result.status);
  }
  return result;
}

// Start DB
run('docker', [
  'compose',
  '-f',
  'docker-compose.dev.yml',
  'up',
  '-d',
  'neon-local',
]);

console.log('⏳ Waiting for the database to be ready...');
const maxRetries = 30;
let retries = 0;
let ready = false;
let lastError = '';

while (retries < maxRetries && !ready) {
  const check = spawnSync(
    'docker',
    [
      'compose',
      '-f',
      'docker-compose.dev.yml',
      'exec',
      '-T',
      'neon-local',
      'psql',
      'postgres://neon:npg@127.0.0.1/main',
      '-c',
      'SELECT 1',
    ],
    { env }
  );

  if (check.status === 0) {
    ready = true;
    console.log('✅ Database is ready!');
  } else {
    lastError = check.stderr ? check.stderr.toString() : 'Unknown Error';
    process.stdout.write('.');
    retries++;
    // wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

if (!ready) {
  console.error('\n❌ Database failed to start within time limit.');
  console.error('\nLast Error from psql:');
  console.error(lastError);
  process.exit(1);
}

// Migrations
console.log('\n📜 Applying latest schema with Drizzle...');
const migrationEnv = {
  ...env,
  DATABASE_URL: env.DATABASE_URL.replace('neon-local', '127.0.0.1'),
};
run('npm', ['run', 'db:migrate'], { env: migrationEnv });

// Start App
console.log('📦 Starting Application...');
run('docker', ['compose', '-f', 'docker-compose.dev.yml', 'up', '--build']);
