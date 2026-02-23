#!/bin/bash
set -e

DOMAIN_API="api.institutodepsicologiayeducacion.com"
DOMAIN_PGADMIN="pgadmin.institutodepsicologiayeducacion.com"
EMAIL="admin@ipe.edu.pe"

echo "=== 1. Instalando Nginx y Certbot ==="
apt update
apt install -y nginx certbot python3-certbot-nginx

echo "=== 2. Copiando configuraciones de Nginx ==="
cp api.conf /etc/nginx/sites-available/api
cp pgadmin.conf /etc/nginx/sites-available/pgadmin

ln -sf /etc/nginx/sites-available/api /etc/nginx/sites-enabled/api
ln -sf /etc/nginx/sites-available/pgadmin /etc/nginx/sites-enabled/pgadmin

# Eliminar default si existe
rm -f /etc/nginx/sites-enabled/default

echo "=== 3. Verificando configuracion de Nginx ==="
nginx -t

echo "=== 4. Reiniciando Nginx ==="
systemctl restart nginx
systemctl enable nginx

echo "=== 5. Generando certificados SSL ==="
certbot --nginx -d "$DOMAIN_API" -d "$DOMAIN_PGADMIN" --non-interactive --agree-tos -m "$EMAIL"

echo "=== 6. Verificando renovacion automatica ==="
certbot renew --dry-run

echo ""
echo "=== LISTO ==="
echo "API + Swagger: https://$DOMAIN_API/docs"
echo "pgAdmin:       https://$DOMAIN_PGADMIN"
echo ""
echo "Los certificados se renuevan automaticamente."
