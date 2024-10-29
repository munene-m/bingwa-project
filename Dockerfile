FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

RUN npm install -g @nestjs/cli

COPY . .

RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

RUN npx prisma generate

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
