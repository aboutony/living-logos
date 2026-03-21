#!/bin/bash
# ═══════════════════════════════════════════════════════
# Nginx Reverse Proxy Setup — Living Logos
# Usage: bash deploy/setup-nginx.sh yourdomain.com
# ═══════════════════════════════════════════════════════

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "Usage: bash deploy/setup-nginx.sh yourdomain.com"
    exit 1
fi

echo "► Setting up Nginx reverse proxy for $DOMAIN..."

sudo tee /etc/nginx/sites-available/living-logos > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # SSE support — disable buffering for EventSource
        proxy_buffering off;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/living-logos /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx reverse proxy configured for $DOMAIN"
echo "   Next: run deploy/setup-ssl.sh $DOMAIN"
