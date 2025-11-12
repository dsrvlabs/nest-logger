const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// scripts/postinstall.js에서 실행되므로 상위 디렉토리가 패키지 루트
const pkgDir = path.resolve(__dirname, '..');
const distFile = path.join(pkgDir, 'dist/index.js');

if (!fs.existsSync(distFile)) {
  try {
    console.log('Building nest-logger...');
    execSync('npx nest build', {
      stdio: 'inherit',
      cwd: pkgDir,
      env: { ...process.env }
    });
    console.log('Build completed successfully');
  } catch (e) {
    console.error('Build failed:', e.message);
    process.exit(1);
  }
} else {
  console.log('Build already exists, skipping...');
}

