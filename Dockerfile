########################
# BUILD STAGE
########################
FROM node:20-alpine AS builder
WORKDIR /app

# install ALL deps (dev + prod) but skip post-install hooks (husky)
COPY package*.json ./
RUN npm ci --ignore-scripts

# copy source & transpile TS → dist/
COPY . .
RUN npm run build

########################
# RUNTIME STAGE
########################
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# only prod deps here
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# static assets the compiled code expects
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/swagger.json ./
COPY --from=builder /app/prisma      ./prisma

RUN npm run prisma:generate

CMD ["node", "dist/server.js"]
