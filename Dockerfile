FROM node:20

WORKDIR /app

COPY ./package*.json .

RUN npm install typescript -g

RUN npm ci

COPY . .

RUN npm run build

RUN npm run prisma:generate

EXPOSE 3000

CMD ["node", "dist/main.js"]
