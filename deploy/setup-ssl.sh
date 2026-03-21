#!/bin/bash
# ═══════════════════════════════════════════════════════
# SSL Certificate via Certbot — Living Logos
# Usage: bash deploy/setup-ssl.sh yourdomain.com
# ═══════════════════════════════════════════════════════

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "Usage: bash deploy/setup-ssl.sh yourdomain.com"
    exit 1
fi

echo "► Generating SSL certificate for $DOMAIN..."
sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║  ✅ SSL Active — Green Lock Restored           ║"
echo "║  URL: https://$DOMAIN                         ║"
echo "╚═══════════════════════════════════════════════╝"
