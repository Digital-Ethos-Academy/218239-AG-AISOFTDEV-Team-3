#!/bin/bash

echo "===================================="
echo " Frontend Quick Start"
echo "===================================="
echo

echo "Checking if we're in the right directory..."
if [ ! -f "artifacts/React/src/App.jsx" ]; then
    echo "ERROR: Please run this script from the AI_Driven_Software_Engineering directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "✓ Found React directory"
echo

echo "Setting up frontend..."
cd artifacts/React

echo "Installing Node.js dependencies..."
npm install

echo "Installing react-icons..."
npm install react-icons

echo "Starting React development server..."
echo "Frontend will run on http://localhost:3000"
echo
echo "===================================="
echo " Frontend is starting..."
echo " Your browser should open automatically"
echo "===================================="
echo

npm start
