#!/usr/bin/env python
import os
from dotenv import load_dotenv

# Load environment variables FIRST before importing app
load_dotenv()

from app import create_app
from app.config.config import get_config

# Create app
app = create_app()
config = get_config()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    
    print(f'🚀 Server running on port {port}')
    print(f'📧 Email: {"Configured" if config.EMAIL_USER else "Not configured"}')
    print(f'🔐 Supabase: {"Connected" if config.SUPABASE_URL else "Not connected"}')
    
    app.run(
        debug=config.DEBUG,
        host='0.0.0.0',
        port=port,
        use_reloader=True
    )
