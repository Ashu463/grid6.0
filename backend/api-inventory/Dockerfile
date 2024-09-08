FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm install -g pm2

RUN npm install -g prisma

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 9000

CMD ["pm2-runtime", "start", "dist/main.js"]
