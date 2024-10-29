# Stage 1 - Build Stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --production

RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

