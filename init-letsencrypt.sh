#!/usr/bin/env bash
# Run this once on the server, after DNS for $API_DOMAIN already points at it,
# to obtain the first Let's Encrypt certificate. nginx can't start with the
# real config until a cert exists at the expected path, and certbot can't get
# a cert until nginx is running to answer the HTTP-01 challenge — this script
# breaks that cycle with a throwaway self-signed cert just long enough to boot
# nginx, then swaps in the real one. Renewal afterwards is automatic via the
# certbot service's loop in docker-compose.yml.
set -e

if [ ! -f .env ]; then
  echo ".env not found — copy .env.example to .env and fill it in first." >&2
  exit 1
fi

set -a
source .env
set +a

if [ -z "$API_DOMAIN" ] || [ -z "$CERTBOT_EMAIL" ]; then
  echo "API_DOMAIN and CERTBOT_EMAIL must be set in .env" >&2
  exit 1
fi

DUMMY_PATH="/etc/letsencrypt/live/$API_DOMAIN"

echo "### Creating a temporary self-signed certificate so nginx can start..."
mkdir -p "./nginx/certbot/conf/live/$API_DOMAIN"
docker compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout '$DUMMY_PATH/privkey.pem' \
    -out '$DUMMY_PATH/fullchain.pem' \
    -subj '/CN=localhost'" certbot

echo "### Starting nginx..."
docker compose up -d nginx

echo "### Deleting the temporary certificate..."
docker compose run --rm --entrypoint "\
  rm -rf /etc/letsencrypt/live/$API_DOMAIN \
         /etc/letsencrypt/archive/$API_DOMAIN \
         /etc/letsencrypt/renewal/$API_DOMAIN.conf" certbot

echo "### Requesting the real certificate from Let's Encrypt..."
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email $CERTBOT_EMAIL -d $API_DOMAIN \
    --rsa-key-size 2048 --agree-tos --non-interactive" certbot

echo "### Reloading nginx with the real certificate..."
docker compose exec nginx nginx -s reload

echo "Done. HTTPS is live for https://$API_DOMAIN"
