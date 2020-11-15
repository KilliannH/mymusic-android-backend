FROM node:10

RUN mkdir -p /user/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i -g nodemon

RUN npm install

COPY . .

EXPOSE 8080

CMD ["nodemon"]
