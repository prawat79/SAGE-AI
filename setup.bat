@echo off
echo ===================================================
echo FlowGPT Clone Setup Script
echo ===================================================
echo.

echo Checking for Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js first.
    echo Visit: https://nodejs.org/
    echo.
    echo After installing Node.js, run this script again.
    echo.
    echo Refer to INSTALLATION_GUIDE.md for detailed installation instructions.
    pause
    exit /b
)

echo Node.js is installed. Checking version...
node -v
echo.

echo Checking for npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed correctly.
    echo Please reinstall Node.js which includes npm.
    echo.
    echo Refer to INSTALLATION_GUIDE.md for detailed installation instructions.
    pause
    exit /b
)

echo npm is installed. Checking version...
npm -v
echo.

echo Checking for Git installation...
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Git is not installed. Please install Git first.
    echo Visit: https://git-scm.com/downloads
    echo.
    echo After installing Git, run this script again.
    echo.
    echo Refer to INSTALLATION_GUIDE.md for detailed installation instructions.
    pause
    exit /b
)

echo Git is installed. Checking version...
git --version
echo.

echo All prerequisites are installed!
echo.

echo ===================================================
echo Setting up FlowGPT Clone Project
echo ===================================================
echo.

echo Do you want to initialize the React project with Vite? (Y/N)
set /p init=

if /I "%init%"=="Y" (
    echo.
    echo Initializing React project with Vite...
    echo This may take a few minutes...
    echo.
    call npm create vite@latest . -- --template react
    call npm install
    
    echo.
    echo Installing essential dependencies...
    call npm install react-router-dom tailwindcss postcss autoprefixer @supabase/supabase-js marked react-syntax-highlighter
    
    echo.
    echo Configuring Tailwind CSS...
    call npx tailwindcss init -p
    
    echo.
    echo Creating .env file for Supabase configuration...
    echo VITE_SUPABASE_URL=your_supabase_url > .env
    echo VITE_SUPABASE_ANON_KEY=your_supabase_anon_key >> .env
    
    echo.
    echo Project setup complete!
    echo.
    echo Next steps:
    echo 1. Update the .env file with your Supabase credentials
    echo 2. Run 'npm run dev' to start the development server
    echo 3. Access your application at http://localhost:5173
    echo.
    echo Refer to README.md for project architecture and implementation details.
)

if /I "%init%"=="N" (
    echo.
    echo Project initialization skipped.
    echo.
    echo You can manually set up the project by following the instructions in SETUP_GUIDE.md
)

echo.
echo ===================================================
echo Setup process completed!
echo ===================================================

pause