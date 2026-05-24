# Local Development with Docker Compose

This directory allows you to spin up the complete prepackaged Danube backend cluster (3 brokers, admin server, and Prometheus) from official images, while building and running your local `danube-admin-ui` source code inside a Node container with hot-reloading.

## Prerequisites

Before starting the containers, you need to download the required cluster and metrics configuration files into this directory.

Run the following commands inside this `docker/` folder to fetch them:

```bash
# Download the default Danube broker configuration
curl -o danube_broker.yml https://raw.githubusercontent.com/danube-messaging/danube/main/docker/danube_broker.yml

# Download the default Prometheus scrape configuration
curl -o prometheus.yml https://raw.githubusercontent.com/danube-messaging/danube/main/docker/prometheus.yml
```

## Running the Stack

Once the configuration files are present in this directory, you can build and start the entire stack:

```bash
docker-compose up --build
```

The application will be available at **http://localhost:5173** and will automatically reload when you make changes to your local files.

## Stopping the Stack

To stop the services and clean up containers and volumes:

```bash
docker-compose down -v
```
