import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.production
const envPath = path.resolve(process.cwd(), '.env.production');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env.production file not found!');
  process.exit(1);
}

const envConfig = dotenv.parse(fs.readFileSync(envPath));
const env = { ...process.env, ...envConfig };

console.log('🚀 Starting Acquisition App in Production Mode');
console.log('===============================================');

// Check docker
const dockerCheck = spawnSync('docker', ['info'], { stdio: 'ignore' });
if (dockerCheck.error || dockerCheck.status !== 0) {
  console.error('❌ Error: Docker is not running!');
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    env,
  });
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

console.log('📦 Building and starting production container...');
run('docker', [
  'compose',
  '-f',
  'docker-compose.prod.yml',
  'up',
  '--build',
  '-d',
]);

console.log('⏳ Waiting for container to start...');
await new Promise(resolve => setTimeout(resolve, 5000));

console.log('📜 Applying latest schema with Drizzle...');
run('npm', ['run', 'db:migrate']);

console.log('\n🎉 Production environment started!');
console.log('   Application: http://localhost:3000');
console.log('   Logs: docker compose -f docker-compose.prod.yml logs -f');
