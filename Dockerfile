
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm cache clean --force
RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:migrate:prod"]