echo "replacing variables"
find dist/static/js/*.js -type f -exec sed -e "s|\$FROALA_KEY|${VUE_APP_FROALA_KEY}|g" \
  -e "s|\$STRIPE_PUBLISHABLE_KEY|${VUE_APP_STRIPE_PUBLISHABLE_KEY}|g" \
  -e "s|\$INTERCOM_APP_ID|${VUE_APP_INTERCOM_APP_ID}|g" \
  -e "s|\$SENTRY_DSN|${VUE_APP_SENTRY_DSN}|g" \
  -e "s|\$BUILD|${VUE_APP_BUILD}|g" \
  -e "s|\$ENVIRONMENT|${VUE_APP_ENVIRONMENT}|g" \
  -e "s|\$BASE_API|${VUE_APP_BASE_API}|g" \
  -e "s|\$WIND_API|${VUE_APP_WIND_API}|g" \
  -e "s|\$GOOGLE_SSO_CLIENT_ID|${VUE_APP_GOOGLE_SSO_CLIENT_ID}|g" \
  -e "s|\$FULLSTORY_ID|${VUE_APP_FULLSTORY_ID}|g" \
  -i {} +
export
nginx -g 'daemon off;'
