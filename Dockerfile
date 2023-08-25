##########
## DEVELOPMENT ##
##########
FROM node:19-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

RUN yarn build

##########
## PRODUCTION ##
##########

FROM node:19-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

COPY --from=development /usr/src/app/build ./build
COPY --from=development /usr/src/app/prisma ./prisma

EXPOSE 1111

RUN npx prisma generate

CMD [ "yarn", "start:migrate:prod" ]