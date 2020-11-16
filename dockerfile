FROM node:10-alpine

RUN apk add --no-cache curl ffmpeg python python-dev py-pip

RUN curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
RUN chmod a+rx /usr/local/bin/youtube-dl

RUN mkdir -p /user/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i -g nodemon

RUN npm install

COPY . .

EXPOSE 8080

CMD ["nodemon"]
