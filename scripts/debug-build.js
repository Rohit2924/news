const { exec } = require('child_process');

console.log('Starting build with debug...');

const buildProcess = exec('npm run build', { 
  stdio: 'inherit' 
});

buildProcess.stdout.on('data', (data) => {
  console.log(data.toString());
  if (data.includes('Generating static pages')) {
    console.log('🔄 Currently generating pages...');
  }
});

buildProcess.stderr.on('data', (data) => {
  console.error('❌ Build error:', data.toString());
});

buildProcess.on('close', (code) => {
  console.log(`Build process exited with code ${code}`);
});