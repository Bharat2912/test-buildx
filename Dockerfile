FROM node:16-alpine as builder
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
RUN npm config set unsafe-perm true
RUN npm install -g typescript
RUN npm install -g ts-node
RUN apk update && apk add --no-cache --update \
    g++ \
    musl-dev \
    python3 \
    python3-dev \
    py3-pip \
    make \
    eudev
COPY --chown=node:node package-lock.json ./
COPY --chown=node:node package.json ./
COPY  --chown=node:node tsconfig.json ./
USER node
RUN npm ci
COPY --chown=node:node . .
RUN npm run build


FROM node:16-alpine
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY  --chown=node:node package-lock.json ./
COPY  --chown=node:node package.json ./
RUN apk update && apk add --no-cache --update \
    g++ \
    musl-dev \
    python3 \
    python3-dev \
    py3-pip \
    make \
    eudev
USER node
RUN npm ci --production
COPY --from=builder /home/node/app/build ./build
COPY --from=builder /home/node/app/public ./public

ENTRYPOINT ["node"]
# CMD [ "node", "build/index.js" ]