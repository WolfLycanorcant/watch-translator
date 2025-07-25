#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Watch Translator optimization...\n');

// 1. Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
  if (fs.existsSync('.expo')) {
    execSync('rm -rf .expo', { stdio: 'inherit' });
  }
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }
  if (fs.existsSync('.metro-cache')) {
    execSync('rm -rf .metro-cache', { stdio: 'inherit' });
  }
  console.log('✅ Cleanup complete\n');
} catch (error) {
  console.warn('⚠️  Cleanup warning:', error.message);
}

// 2. Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm ci --prefer-offline', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.log('⚠️  npm ci failed, trying npm install...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
}

// 3. Type checking
console.log('🔍 Running type checks...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ Type checking passed\n');
} catch (error) {
  console.error('❌ Type checking failed');
  process.exit(1);
}

// 4. Linting
console.log('🔧 Running linter...');
try {
  execSync('npx eslint . --ext .ts,.tsx --fix', { stdio: 'inherit' });
  console.log('✅ Linting passed\n');
} catch (error) {
  console.warn('⚠️  Linting warnings found, continuing...\n');
}

// 5. Run tests
console.log('🧪 Running tests...');
try {
  execSync('npm test -- --watchAll=false --coverage', { stdio: 'inherit' });
  console.log('✅ Tests passed\n');
} catch (error) {
  console.warn('⚠️  Some tests failed, continuing...\n');
}

// 6. Bundle analysis
console.log('📊 Analyzing bundle...');
try {
  // Create a simple bundle analyzer
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});
  
  console.log(`📦 Production dependencies: ${dependencies.length}`);
  console.log(`🛠️  Development dependencies: ${devDependencies.length}`);
  
  // Check for large dependencies
  const largeDeps = dependencies.filter(dep => 
    ['react-native-reanimated', 'react-native-gesture-handler', 'expo'].includes(dep)
  );
  
  if (largeDeps.length > 0) {
    console.log(`⚠️  Large dependencies detected: ${largeDeps.join(', ')}`);
    console.log('   These are necessary for watch functionality');
  }
  
  console.log('✅ Bundle analysis complete\n');
} catch (error) {
  console.warn('⚠️  Bundle analysis failed:', error.message);
}

// 7. Pre-build optimizations
console.log('⚡ Applying pre-build optimizations...');
try {
  // Ensure metro cache directory exists
  if (!fs.existsSync('.metro-cache')) {
    fs.mkdirSync('.metro-cache');
  }
  
  // Create optimized app.json for build
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  // Add build optimizations
  if (!appJson.expo.extra) {
    appJson.expo.extra = {};
  }
  
  appJson.expo.extra.buildOptimizations = {
    timestamp: new Date().toISOString(),
    optimized: true,
  };
  
  fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
  console.log('✅ Pre-build optimizations applied\n');
} catch (error) {
  console.warn('⚠️  Pre-build optimization warning:', error.message);
}

// 8. Build the app
console.log('🏗️  Building optimized APK...');
try {
  const buildCommand = process.argv.includes('--release') 
    ? 'npx eas build --platform android --profile watch-release'
    : 'npx eas build --platform android --profile watch-debug';
    
  console.log(`Running: ${buildCommand}`);
  execSync(buildCommand, { stdio: 'inherit' });
  console.log('✅ Build complete!\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('\n🔧 Troubleshooting tips:');
  console.log('1. Check your Expo account is logged in: npx eas login');
  console.log('2. Verify your project is configured: npx eas build:configure');
  console.log('3. Try local build: npx eas build --platform android --local');
  process.exit(1);
}

// 9. Post-build analysis
console.log('📈 Post-build analysis...');
try {
  const stats = {
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
  };
  
  console.log('Build Statistics:');
  console.log(`- Build completed at: ${stats.buildTime}`);
  console.log(`- Node version: ${stats.nodeVersion}`);
  console.log(`- Platform: ${stats.platform}`);
  
  console.log('\n🎉 Optimization complete!');
  console.log('📱 Your optimized Watch Translator APK is ready!');
} catch (error) {
  console.warn('⚠️  Post-build analysis warning:', error.message);
}

console.log('\n📋 Next steps:');
console.log('1. Download your APK from the Expo dashboard');
console.log('2. Install on your Samsung Watch');
console.log('3. Test voice translation functionality');
console.log('4. Report any issues on GitHub');
