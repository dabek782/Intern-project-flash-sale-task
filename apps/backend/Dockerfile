FROM node:20-alpine

WORKDIR /backend

COPY apps/backend/package*.json ./

RUN npm install

COPY apps/backend .

# RUN npx prisma generate

RUN npm run build

EXPOSE 5000

CMD [ "npm" , "start" ]
