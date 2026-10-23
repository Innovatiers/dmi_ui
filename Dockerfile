# syntax=docker/dockerfile:1
# Base images are pinned by tag and digest (ADR-034 in cogniawerks-api); Dependabot proposes updates after a 14-day cool-down.
FROM node:26.11.1-alpine3.24@sha256:143494b1da2945f061539253adc65e4f1569ddf07da2d384c022c791a9d90a4a AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# Unprivileged nginx (stable line, tag + digest pinned): runs as non-root and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.30.4-alpine@sha256:adf5042a17f4ecdd200c595fa9ffd1be37efb18f89a830bd1a00e4ab4d59d42c
# No package upgrades inside the image: the base image is updated only through a new tag and digest (DEC-36 point 3).
# A failing Trivy scan between two Dependabot updates is accepted.
USER 101
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
