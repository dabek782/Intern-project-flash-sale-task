FROM node:20-alpine

WORKDIR /frontend

COPY apps/frontend/package*.json ./

RUN npm install

COPY apps/frontend .


RUN npm run build

EXPOSE 3000

CMD [ "npm" , "start" ]
