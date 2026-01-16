#!/bin/bash
# Linux/Mac script to start IDP test server

echo "Starting IDP Plugin Test Server..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found!"
    echo "Please create .env file with required configuration."
    echo ""
fi

# Start the server
python idp_plugin/test_server.py





