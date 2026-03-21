#!/bin/bash
# ═══════════════════════════════════════════════════════
# The Living Logos — Atomic Command 13.5
# "Sovereign" Permission Bypass
# Run this ON THE VPS: bash deploy/permission-bypass.sh
# ═══════════════════════════════════════════════════════

set -e

echo "╔═══════════════════════════════════════════════╗"
echo "║  Atomic Command 13.5 — Permission Bypass      ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# ─── 1. Binary Trust: Ensure yt-dlp is executable ───
echo "► Step 1: Binary Trust — chmod +x yt-dlp"
YT_DLP_PATH=$(which yt-dlp 2>/dev/null || echo "")

if [ -z "$YT_DLP_PATH" ]; then
    echo "  ❌ yt-dlp not found in PATH. Attempting pip3 install..."
    sudo pip3 install --break-system-packages yt-dlp --pre
    YT_DLP_PATH=$(which yt-dlp)
fi

echo "  ✓ yt-dlp found at: $YT_DLP_PATH"
sudo chmod +x "$YT_DLP_PATH"
echo "  ✓ Execute permission granted"
echo "  ✓ Version: $(yt-dlp --version)"
echo ""

# ─── 2. Firewall Open: Allow outgoing YouTube traffic ───
echo "► Step 2: Firewall — Ensuring outgoing HTTPS is allowed"
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | head -1)
    echo "  UFW status: $UFW_STATUS"
    if echo "$UFW_STATUS" | grep -qi "active"; then
        sudo ufw default allow outgoing 2>/dev/null || true
        sudo ufw allow out 443/tcp 2>/dev/null || true
        echo "  ✓ Outgoing HTTPS (443) allowed"
    else
        echo "  ✓ UFW inactive — all outgoing traffic allowed by default"
    fi
else
    echo "  ✓ No UFW installed — outgoing traffic unrestricted"
fi
echo ""

# ─── 3. Pre-Flight Check: Manual yt-dlp test ───
echo "► Step 3: Pre-Flight Check — Testing yt-dlp URL resolution"
echo "  Running: yt-dlp --get-url -f \"bestaudio\" \"https://www.youtube.com/watch?v=Evrychou2831\""
echo ""

RESOLVED_URL=$(yt-dlp --get-url -f "bestaudio" --no-warnings "https://www.youtube.com/watch?v=Evrychou2831" 2>&1) || true

if echo "$RESOLVED_URL" | grep -q "googlevideo.com"; then
    echo "  ✓ Pre-flight PASSED — Direct audio URL resolved"
    echo "  URL prefix: ${RESOLVED_URL:0:100}..."
else
    echo "  ⚠ Pre-flight result (may indicate issue):"
    echo "  $RESOLVED_URL"
    echo ""
    echo "  If this failed, try:"
    echo "    1. yt-dlp -U                    # Update yt-dlp"
    echo "    2. Check if the stream is live   # Video may be offline"
fi
echo ""

# ─── 4. Restart PM2 ───
echo "► Step 4: Restarting PM2 processes"
cd /var/www/living-logos
pm2 restart all
echo ""

echo "► PM2 Status:"
pm2 list
echo ""

echo "► Recent logs (last 10 lines):"
pm2 logs --nostream --lines 10 2>/dev/null || true
echo ""

echo "╔═══════════════════════════════════════════════╗"
echo "║  ✓ Atomic 13.5 Complete                       ║"
echo "║                                                ║"
echo "║  Next: Navigate to thelivinglogos.io           ║"
echo "║  → Click LIVE → Verify 📡 LIVE status          ║"
echo "║  → Confirm Arabic subtitles appear             ║"
echo "╚═══════════════════════════════════════════════╝"
