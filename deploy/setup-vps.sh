#!/bin/bash
# ═══════════════════════════════════════════════════════
# The Living Logos — Hostinger VPS Setup Script
# Atomic Command 12.2: Direct Audio Pipe
# Target: Ubuntu 24.04 LTS
# ═══════════════════════════════════════════════════════

set -e

echo "╔═══════════════════════════════════════════════╗"
echo "║  The Living Logos — VPS Provisioning           ║"
echo "║  Atomic Command 12.2: Direct Audio Pipe        ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# ─── 1. System Update ───
echo "► Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y

# ─── 2. Install Core Binaries ───
echo "► Step 2: Installing ffmpeg, python3-pip, curl, git..."
sudo apt install -y ffmpeg python3-pip curl git build-essential

# ─── 3. Install yt-dlp (nightly/pre-release for latest throttle fixes) ───
echo "► Step 3: Installing yt-dlp nightly..."
sudo pip3 install --break-system-packages yt-dlp --pre
# Force update to absolute latest
sudo yt-dlp -U 2>/dev/null || true
# Verify
echo "  ✓ yt-dlp version: $(yt-dlp --version)"
echo "  ✓ ffmpeg version: $(ffmpeg -version 2>&1 | head -1)"

# ─── 4. Install Node.js 20 LTS via NodeSource ───
echo "► Step 4: Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo "  ✓ Node.js: $(node -v)"
echo "  ✓ npm: $(npm -v)"

# ─── 5. Install PM2 ───
echo "► Step 5: Installing PM2 process manager..."
sudo npm install -g pm2
echo "  ✓ PM2: $(pm2 -v)"

# ─── 6. Install Certbot for SSL ───
echo "► Step 6: Installing Certbot + Nginx..."
sudo apt install -y nginx certbot python3-certbot-nginx

# ─── 7. Clone Repository ───
echo "► Step 7: Cloning Living Logos repository..."
APP_DIR="/var/www/living-logos"
if [ -d "$APP_DIR" ]; then
    echo "  ⚠ Directory exists, pulling latest..."
    cd "$APP_DIR"
    git pull origin master
else
    sudo mkdir -p /var/www
    sudo chown $USER:$USER /var/www
    git clone https://github.com/aboutony/living-logos.git "$APP_DIR"
    cd "$APP_DIR"
fi

# ─── 8. Install Dependencies ───
echo "► Step 8: Installing npm dependencies..."
cd "$APP_DIR"
npm install

# ─── 9. Setup Environment ───
echo "► Step 9: Setting up environment..."
if [ ! -f "$APP_DIR/.env.local" ]; then
    cp "$APP_DIR/deploy/.env.production" "$APP_DIR/.env.local"
    echo "  ⚠ IMPORTANT: Edit /var/www/living-logos/.env.local and add your OPENAI_API_KEY"
else
    echo "  ✓ .env.local already exists"
fi

# ─── 10. Build ───
echo "► Step 10: Building production bundle..."
cd "$APP_DIR"
npm run build

# ─── 11. Start with PM2 ───
echo "► Step 11: Starting with PM2..."
cd "$APP_DIR"
pm2 delete living-logos 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u $USER --hp $HOME

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║  ✓ VPS Setup Complete!                         ║"
echo "║                                                ║"
echo "║  Next steps:                                   ║"
echo "║  1. Edit .env.local with your OPENAI_API_KEY   ║"
echo "║  2. Run: deploy/setup-nginx.sh YOUR_DOMAIN     ║"
echo "║  3. Run: deploy/setup-ssl.sh YOUR_DOMAIN       ║"
echo "╚═══════════════════════════════════════════════╝"
