#!/usr/bin/env python3
"""
MongoFlow Studio - Development Server
Runs the Flask application with static file serving for development
"""

import os
import subprocess
import sys
from pathlib import Path

def main():
    print("🚀 Starting MongoFlow Studio Development Server...")
    print("📁 Working directory:", os.getcwd())

    # Check if .env.local exists
    env_file = Path('.env.local')
    if not env_file.exists():
        print("⚠️  Warning: .env.local not found. Copy .env.example to .env.local and add your MongoDB password")
        print("   Example: cp .env.example .env.local")
        print()

    # Check if requirements are installed
    try:
        import flask
        import pymongo
        import flask_cors
        import flask_limiter
        import jsonschema
        print("✅ Python dependencies installed")
    except ImportError as e:
        print(f"❌ Missing Python dependencies: {e}")
        print("Run: pip install -r requirements.txt")
        sys.exit(1)

    print("🌐 Starting Flask development server...")
    print("📡 API will be available at: http://localhost:5000")
    print("🖥️  Frontend will be available at: http://localhost:5000")
    print("🔄 Both API and static files served from the same server")
    print()
    print("Press Ctrl+C to stop the server")
    print("-" * 50)

    # Run the Flask app
    try:
        subprocess.run([sys.executable, 'api.py'], check=True)
    except KeyboardInterrupt:
        print("\n👋 Development server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()