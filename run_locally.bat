@echo off

call npm install

echo "Building server-dockerimage"
docker build -t provr-auth-microservice .

echo "Starting server-dockerimage"
docker run -p 49100:8080 -d --name auth-microservice provr-auth-microservice

echo "Composing MySQL database from the docker-compose.yml"
docker-compose up

pause
