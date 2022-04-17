# Prod
FROM node:16

WORKDIR /usr/src/app

COPY ./dist/package*.json ./

RUN npm install

COPY . .

COPY ./dist ./dist

CMD ["node", "dist/main"]
