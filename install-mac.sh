#!/bin/bash
set -e

echo "====================================="
echo " Jira Ticket Organizer — macOS Setup"
echo "====================================="
echo ""

# Navigate to the directory containing this script
cd "$(dirname "$0")"

# ── Check for Node.js ──────────────────────────────────────
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  echo "✓ Node.js already installed: $NODE_VERSION"
else
  echo "Node.js not found."
  echo ""

  # Try Homebrew first
  if command -v brew &> /dev/null; then
    echo "Installing Node.js via Homebrew..."
    brew install node
    echo "✓ Node.js installed."
  else
    echo "Homebrew is also not installed."
    echo ""
    echo "Please install Node.js manually:"
    echo "  → https://nodejs.org  (download the LTS .pkg installer)"
    echo ""
    echo "After installing Node.js, run this script again."
    exit 1
  fi
fi

echo ""

# ── Install dependencies ───────────────────────────────────
echo "Installing app dependencies (this may take a minute)..."
npm install
echo "✓ Dependencies installed."

echo ""

# ── Make the launcher executable ──────────────────────────
chmod +x start-mac.command 2>/dev/null || true

echo "====================================="
echo " Setup complete!"
echo "====================================="
echo ""
echo "To launch the app:"
echo "  • Double-click  start-mac.command  in Finder"
echo "  • OR run:  ./start-mac.command  from this directory"
echo ""
