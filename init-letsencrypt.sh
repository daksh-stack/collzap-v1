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
