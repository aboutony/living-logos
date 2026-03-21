#!/bin/bash
# ═══════════════════════════════════════════════════════
# Binary Validation Script — Atomic 09
# Ensures spawn("ffmpeg") and spawn("yt-dlp") resolve
# ═══════════════════════════════════════════════════════

echo "═══ Binary Validation — Living Logos Sovereign Relay ═══"
echo ""

PASS=true

# ffmpeg
if command -v ffmpeg &> /dev/null; then
    echo "✅ ffmpeg:   $(which ffmpeg)"
    echo "   Version: $(ffmpeg -version 2>&1 | head -1)"
else
    echo "❌ ffmpeg:   NOT FOUND — run: sudo apt install ffmpeg"
    PASS=false
fi
echo ""

# yt-dlp
if command -v yt-dlp &> /dev/null; then
    echo "✅ yt-dlp:   $(which yt-dlp)"
    echo "   Version: $(yt-dlp --version)"
else
    echo "❌ yt-dlp:   NOT FOUND — run: pip3 install yt-dlp"
    PASS=false
fi
echo ""

# Node.js
if command -v node &> /dev/null; then
    echo "✅ node:     $(which node)"
    echo "   Version: $(node -v)"
else
    echo "❌ node:     NOT FOUND"
    PASS=false
fi
echo ""

# npm
if command -v npm &> /dev/null; then
    echo "✅ npm:      $(which npm)"
    echo "   Version: $(npm -v)"
else
    echo "❌ npm:      NOT FOUND"
    PASS=false
fi
echo ""

# PM2
if command -v pm2 &> /dev/null; then
    echo "✅ pm2:      $(which pm2)"
    echo "   Version: $(pm2 -v)"
else
    echo "⚠️  pm2:      NOT FOUND — run: npm install -g pm2"
fi
echo ""

# Node.js spawn test
echo "═══ Node.js spawn() test ═══"
node -e "
const { execSync } = require('child_process');
try {
    const ffOut = execSync('ffmpeg -version', { encoding: 'utf-8' }).split('\n')[0];
    console.log('✅ spawn(\"ffmpeg\"): ' + ffOut);
} catch (e) {
    console.log('❌ spawn(\"ffmpeg\"): ENOENT — ' + e.message);
}
try {
    const ytOut = execSync('yt-dlp --version', { encoding: 'utf-8' }).trim();
    console.log('✅ spawn(\"yt-dlp\"): ' + ytOut);
} catch (e) {
    console.log('❌ spawn(\"yt-dlp\"): ENOENT — ' + e.message);
}
"
echo ""

if [ "$PASS" = true ]; then
    echo "═══════════════════════════════════════════════"
    echo "  ✅ ALL BINARIES VALIDATED — Sovereign Relay ready"
    echo "═══════════════════════════════════════════════"
else
    echo "═══════════════════════════════════════════════"
    echo "  ❌ MISSING BINARIES — Install before deploying"
    echo "═══════════════════════════════════════════════"
    exit 1
fi
