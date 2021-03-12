echo "Executing"

# npm install

# Initialize docker image for server

# echo "Initializing image and running container for server"

# docker build -t provr-auth-microservice .

# docker run -p 49100:8080 -d --name auth-microservice provr-auth-microservice

# !! BEFORE WE RUN THIS BAT SCRIPT WE NEED TO DO DELETE ALL OLD DOCKER IMAGES !!

echo "Initialize image and running container for MySQL database, Redis and the authentication microservice"

docker-compose up




