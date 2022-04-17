# Prod
FROM node:16

WORKDIR /usr/src/app

COPY ./dist/package*.json ./

COPY ./dist/decorate-angular-cli.js ./

RUN npm install --force

COPY . .

COPY ./dist ./dist

CMD ["node", "dist/main"]
