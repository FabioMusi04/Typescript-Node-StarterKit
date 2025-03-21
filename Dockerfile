FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 9000 

CMD ["npm" , "run" , "docs"]
CMD ["npm" , "run" , "dev"]
