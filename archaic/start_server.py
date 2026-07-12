#!/usr/bin/env python3
"""
Stable Flask server launcher for far-flare
Handles graceful startup and error recovery
"""

import os
import sys
import logging
from app import app

def main():
    """Start the Flask development server with proper configuration"""
    try:
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Get host and port from environment or use defaults
        host = os.getenv('FLASK_HOST', '127.0.0.1')
        port = int(os.getenv('FLASK_PORT', '5000'))
        
        print(f"🚀 Starting far-flare API server...")
        print(f"📍 URL: http://{host}:{port}")
        print(f"🔗 Test URL: http://{host}:{port}/api/info")
        print(f"⚙️  CORS enabled for localhost:8080 and localhost:4321")
        print("-" * 50)
        
        # Start the Flask app
        app.run(
            host=host,
            port=port,
            debug=False,  # Disable debug to prevent restarts
            threaded=True,
            use_reloader=False  # Disable auto-reload to prevent crashes
        )
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()