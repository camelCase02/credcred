#!/bin/bash

# Healthcare Provider Credentialing Service Startup Script

echo "🏥 Starting Healthcare Provider Credentialing Service"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

# Check if data files exist
if [ ! -f "data/providers.json" ]; then
    echo "❌ data/providers.json not found!"
    exit 1
fi

if [ ! -f "data/regulations.json" ]; then
    echo "❌ data/regulations.json not found!"
    exit 1
fi

# Run demo first
echo "🚀 Running demo to test the service..."
python3 demo.py

echo ""
echo "✅ Service is ready!"
echo ""
echo "🌐 To start the API server, run:"
echo "   python3 main.py"
echo ""
echo "📊 To run tests, run:"
echo "   python3 test_credentialing.py"
echo ""
echo "📖 API documentation will be available at:"
echo "   http://localhost:8000/docs"
echo "" 