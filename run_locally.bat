@echo off

REM call npm install

REM  "Building server-dockerimage"
REM docker build -t provr-auth-microservice .

REM echo "Starting server-dockerimage"
REM docker run -p 49100:8080 -d --name auth-microservice provr-auth-microservice

REM !! BEFORE WE RUN THIS BAT SCRIPT WE NEED TO DO DELETE ALL OLD DOCKER IMAGES !!

echo "Composing MySQL database from the docker-compose.yml"
docker-compose up

pause
