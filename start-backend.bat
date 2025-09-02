@echo off
echo ====================================
echo  Inventory System Quick Start
echo ====================================
echo.

echo Checking if we're in the right directory...
if not exist "app\main.py" (
    echo ERROR: Please run this script from the AI_Driven_Software_Engineering directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo ✓ Found app directory
echo.

echo Setting up backend...
cd app

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

echo Starting backend server...
echo Backend will run on http://localhost:8000
echo.
echo ====================================
echo  Backend is starting...
echo  Keep this window open!
echo  Open a new terminal to start frontend
echo ====================================
echo.

python main.py
