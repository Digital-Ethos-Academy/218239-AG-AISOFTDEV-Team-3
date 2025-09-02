#!/bin/bash

echo "===================================="
echo " Inventory System Quick Start"
echo "===================================="
echo

echo "Checking if we're in the right directory..."
if [ ! -f "app/main.py" ]; then
    echo "ERROR: Please run this script from the AI_Driven_Software_Engineering directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "✓ Found app directory"
echo

echo "Setting up backend..."
cd app

echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Starting backend server..."
echo "Backend will run on http://localhost:8000"
echo
echo "===================================="
echo " Backend is starting..."
echo " Keep this terminal open!"
echo " Open a new terminal to start frontend"
echo "===================================="
echo

python main.py
