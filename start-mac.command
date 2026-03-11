#!/bin/bash
# Double-clickable launcher — macOS opens .command files in Terminal from Finder

cd "$(dirname "$0")"

echo "====================================="
echo " Jira Ticket Organizer"
echo "====================================="
echo ""
echo "Starting server at http://localhost:3000"
echo "Your browser will open automatically."
echo ""
echo "Press Ctrl+C (or close this window) to stop the server."
echo ""

# Open browser after server has had a moment to start
(sleep 2 && open http://localhost:3000) &

npm start
