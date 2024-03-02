FROM node:16.7-bullseye
WORKDIR /app

ADD ./package*.json /app/darwin-frontend/

RUN cd /app/darwin-frontend && npm ci

ARG BASE_API
ENV VUE_APP_BASE_API=$BASE_API
# sha of the latest commit
# used to identify releases for error tracking
ARG BUILD
ENV VUE_APP_BUILD=$BUILD

ARG FROALA_KEY
ENV VUE_APP_FROALA_KEY=$FROALA_KEY

ARG STRIPE_PUBLISHABLE_KEY
ENV VUE_APP_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY

ARG THEME
ENV VUE_APP_THEME=$THEME

ARG GOOGLE_SSO_CLIENT_ID
ENV VUE_APP_GOOGLE_SSO_CLIENT_ID_THEME=$GOOGLE_SSO_CLIENT_ID

ARG ASSETS_PORT
ENV ASSETS_PORT=$ASSETS_PORT

ARG STORYBOOK

#Add local files
WORKDIR /
ADD . /app/darwin-frontend

#build
WORKDIR /app/darwin-frontend/
RUN npm run postinstall
RUN npm run build --loglevel verbose

#storybook
RUN test -z $STORYBOOK || npm run storybook:build

FROM nginx:1.23.1-alpine

ARG BASE_API
ENV VUE_APP_BASE_API=$BASE_API
# sha of the latest commit
# used to identify releases for error tracking
ARG BUILD
ENV VUE_APP_BUILD=$BUILD

ARG FROALA_KEY
ENV VUE_APP_FROALA_KEY=$FROALA_KEY

ARG STRIPE_PUBLISHABLE_KEY
ENV VUE_APP_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY

ARG THEME
ENV VUE_APP_THEME=$THEME

ARG GOOGLE_SSO_CLIENT_ID
ENV VUE_APP_GOOGLE_SSO_CLIENT_ID_THEME=$GOOGLE_SSO_CLIENT_ID

ARG ASSETS_PORT
ENV ASSETS_PORT=$ASSETS_PORT

ARG STORYBOOK

WORKDIR /app/darwin-frontend

COPY --from=0 /app/darwin-frontend .


#setup nginx
RUN rm /etc/nginx/nginx.conf
RUN cp /app/darwin-frontend/nginx.conf /etc/nginx/

EXPOSE 80

CMD ["/bin/sh", "run.sh"]
