### Project setup

## Prerequisites

1. Docker and docker compose installed on your machine
2. Node.js and npm installed

```bash
$ git clone https://github.com/munene-m/bingwa-project.git
$ cd bingwa-project
$ npm install
```

## Create an `.env` file in the root directory of your project and set your environment variables

```bash
DATABASE_URL="mysql://crmuser:crmpassword@localhost:3306/crm_db"
PORT=4000
JWT_SECRET=e289c33fb3897ca28d0c216e3a1c5581ca22a0c07985208678b76ed33a7635ed3884a80d946b7d8eced4dfbc45e4a08a49716b3fc27e2fa2b363fbafa8c34fc3
JWT_ISSUER='jwt-nodejs-security'
JWT_AUDIENCE='jwt-nodejs-security'
```

## Docker setup

Ensure Docker is running. Then, start the MySQL database and the NestJS application using Docker Compose.

```bash
docker-compose up -d
```

This will

- Start a MySQL container with the database specified in the `.env` file

## Database migrations

```bash
# development
$ npx prisma migrate dev --name init

```

## Running the application

```bash
$ npm run start:dev
```

## Run tests

```bash
# unit tests
$ npm run test
```
