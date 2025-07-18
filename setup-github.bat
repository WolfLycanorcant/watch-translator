@echo off
echo ========================================
echo    GitHub Repository Setup
echo ========================================

echo This will help you set up GitHub Actions to build your APK automatically.
echo.

echo Step 1: Create a GitHub repository
echo 1. Go to https://github.com/new
echo 2. Name it "watch-translator" or similar
echo 3. Make it public (required for free GitHub Actions)
echo 4. Don't initialize with README (we have one)
echo.

echo Step 2: Upload your code
echo Run these commands in order:
echo.
echo git init
echo git add .
echo git commit -m "Initial commit - Watch Translator app"
echo git branch -M main
echo git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
echo git push -u origin main
echo.

echo Step 3: Trigger the build
echo 1. Go to your GitHub repository
echo 2. Click on "Actions" tab
echo 3. Click "Build APK (Local Build)"
echo 4. Click "Run workflow"
echo 5. Wait 10-15 minutes for build to complete
echo 6. Download APK from "Artifacts" section
echo.

echo ========================================
echo Your APK will be ready for download!
echo ========================================
pause