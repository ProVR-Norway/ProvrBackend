# ProvrBackend

[![GitHub Super-Linter](https://github.com/ProVR-Norway/ProvrBackend/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/marketplace/actions/super-linter) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/ProVR-Norway/ProvrBackend.svg)](https://GitHub.com/Naereen/StrapDown.js/issues/)
[![GitHub stars](https://img.shields.io/github/stars/ProVR-Norway/ProvrBackend.svg?style=social&label=Star&maxAge=2592000)](https://GitHub.com/Naereen/StrapDown.js/stargazers/) 

## Usage

> **Note**: You will need to be inside the folder `server` of the respective API when running the commands mentioned below.

### Running one of the APIs locally
`nodemon server.js`
### Running the mocha test code of one API
`npm test`

## Endpoints

- `/auth/login`
- `/auth/register`
- `/auth/auth_check`
- `/cadmodels`
- `/cadmodels/signedurl`
- `/cadmodels/pub-sub`
- `/sessions`
- `/sessions/{sessionId}/participants`
- `/sessions/{sessionId}/invited`

## Setting up Cloud SQL (MySQL)

### Why Cloud SQL?

To host our MySQL database we used a Google Cloud service called Cloud SQL. This service helps us to ensure an extra layer of security, since only the microservices running on Cloud Run that have a connection to it, will be able to access its data. Likewise, it provides scalability, since its capacity can be automatically adjusted based on usage.

### Security

All sensitive data for the database is stored as GitHub secrets. To find the values of these you will need to check the info about the Cloud SQL instance on Google Cloud. 

> **Note**: The host of the MySQL is set to the value under `Private IP address`. Do not use the public one!

### Accessing the instance

Without enabling `Public IP` under the settings of the Cloud SQL instance, you will not be able to access the server without it happening through a service running on Cloud Run.

> **Note**: The service running on Cloud Run will not be able to access the MySQL server unless it is connected to it! This happens in the GitHub Action workflow-file, but it can be done manually also (`EDIT & DEPLOY NEW REVISION` < `CONNECTIONS` < `Cloud SQL connections`).

When `Public IP` is enabled you will need to select your current IP Address. When your IP has been added, you can access the server through the Cloud Shell by using the following command: `gcloud sql connect <NAME-OF-CLOUD-SQL-INSTANCE> -u <USERNAME-OF-THE-CLOUD-SQL-INSTANCE>`

To make a connection to the Cloud SQL instance from Cloud Run you will need to make sure that they are both in the same region (e.g. `us-west1`). In addition, they will need to run on the same network in Google Cloud. In most cases this network will be called `default`.

## Setting up Memorystore (Redis)

### Why Memorystore?

We use the Google Cloud service Memorystore to store the tokens that are used to authorise users that want to access specific resources. Unlike Cloud SQL that uses an SSD (or HDD) to store data, redis on Memorystore is placed in the cache. This ensures super-fast read and write operations, making it ideal for temporary data that is frequently accessed. Much like Cloud SQL, Memorystore increases security and ensures scalability.

### Security

All sensitive data for Redis is stored as GitHub secrets. To find the values of these you will need to check the info about the Memorystore (Redis) instance on Google Cloud.

> **Note**: The host of the Memorystore (Redis) instance is set to the value under `IP address`.

### Accessing the instance

To be able to access the instance from a service running on Cloud Run, you will need to create a VCP connector first (`VCP network` < `Serverless VPC access`) and then add it to the Cloud Run instance. This happens in the in the GitHub Action workflow file, but it can also be done manually. 

> **Note**: The Memorystore instance will need to be connected to the same network as the VCP connector (`Connection properties` < `Authorized network`). In most cases this network is called `default`.

## Cloud Run

### About the service

Cloud Run is a service on Google Cloud Platform (GCP) that we have used to host our microservices. Using this service, many requests can be sent to each service at a time, and they will be automatically scaled based on the number of requests received.

### Configuration

Each microservice is automatically deployed to Cloud Run on either a push to the development or master branch. The are all configured to be private (`no-allow-unauthenticated`), use the same VCP connector as the redis database (`vpc-connector`), have a connection to the Cloud SQL instance (`add-cloudsql-instances`) and to use our GitHub secrets (`set-env-vars`). To retrieve these variables being set we use the following syntax in Node.js `const MYSQL_HOST = process.env.MYSQL_HOST;`. 

> Note: The API gateway is the only service that is not set to private (`allow-unauthenticated`). This is because it routes all traffic between the client and the microservices, and hence it must be available without authentication. 

## Publisher-Subscriber (Pub/Sub)

### About 

The bucket `user-cad-models` is configured to publish details about new CAD models being uploaded to it to the topic `user-cad-models` under `Pub/Sub > Topics` on Google Cloud. This topic has a subscription named `cad-microservice-subscription` that will send a POST request to the endpoint `/cadmodels/pub-sub` with info about which model was uploaded/changed, at what time it happened, etc. In short, the bucket `user-cad-models` is the **publisher** and the endpoint `/cadmodels/pub-sub` the **subscriber**.

### Setup

The following part of Google Cloud's documentation was used to create the topic and subscription mentioned above: [Create Subscription / Topic](https://cloud.google.com/pubsub/docs/admin)

This link was used to configure Pub/Sub for Cloud Storage for the `user-cad-models` bucket: [Pub/Sub Cloud Storage Config](https://cloud.google.com/storage/docs/reporting-changes#gsutil)
