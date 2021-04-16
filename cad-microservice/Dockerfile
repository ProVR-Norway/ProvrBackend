FROM node:14

# Create app directory
WORKDIR /usr/app/server

#Auth-Microservice/package.json

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY cad-microservice/server/package*.json ./

RUN npm install --production
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY cad-microservice/server .

CMD [ "node", "server.js" ]