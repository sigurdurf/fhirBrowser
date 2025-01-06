FROM node:23
COPY . /app 

WORKDIR /app

RUN npm install webpack

RUN npm install serve

RUN npm install

RUN npm run build

ENTRYPOINT ["sh", "-c", "npm run serve"] 
