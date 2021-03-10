@echo off

echo "Building server-dockerimage"
docker build -t provr-auth-microservice .

echo "Starting server-dockerimage"
docker run -p 49100:8080 -d provr-auth-microservice

echo "Composing MySQL database from the docker-compose.yml"
docker-compose up

pause