#!/bin/sh
echo "starting in development mode"

cat /app/darwin-frontend/nginx.template.conf | \
    envsubst '$BACKEND_HOST $BACKEND_PORT $FRONTEND_PORT $SERVER_URL' > /etc/nginx/nginx.conf

echo "starting nginx..."
exec nginx
