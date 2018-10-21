# escape=`

FROM node:10-alpine as builder
RUN mkdir -p /src/app
WORKDIR /src/app
# use development mode, to have access to devDependencies for compilation
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV
# makes sure npm will install both dependencies and devDependencies
RUN npm config set -g production false
# NOTE: this operation should be done after the step below, but due to a bug with docker
# (https://github.com/docker/compose/issues/1607#issuecomment-403939995) the .dockeringore
# file is being ignored, which causes this operation to overwrite the node_modules/ directory
# inside the container with the host's node_modules/
COPY . .
# install dependencies first in a different location, for easier app bind mounting in local development
# NOTE: uncomment the line below once the bug with dockerignore is fixed and the order of operations is restored
# COPY package.json package-lock.json ./
RUN npm install && npm cache clean --force
ENV PATH node_modules/.bin:$PATH
RUN npm run build


FROM node:10-alpine
# use the built-in "node" user from the nodejs image
ENV USER=node
RUN mkdir -p /src/app
WORKDIR /src/app
# defaults to production, docker compose overrides this when needed
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV
# default to port 8000 for node
ARG PORT=8000
ENV PORT $PORT
EXPOSE $PORT
COPY --from=builder /src/app .
RUN rm -rf /src/app/src
RUN npm prune --production
ENV PATH node_modules/.bin:$PATH
USER $USER
CMD node dist/server.js
