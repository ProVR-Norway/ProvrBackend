echo "Executing"

# npm install

# Initialize docker image for server

echo "Initializing image and running container for server"

docker build -t provrbackend .

docker run -p 49100:8080 -d --name auth-microservice provrbackend

echo "Initialize image and running container for MySQL database"

docker-compose up




