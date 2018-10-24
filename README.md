# Sample Property Listing/Browsing Web Application - Project Catalogue - Backend

## Setup - Production mode

A sample `Dockerfile` and `docker-compose` are available with this repo, but you'll need to adjust it to your production needs and architecture.

## Setup - Development mode

1. Open a console/terminal and `cd` into the repo's `webserver` directory
2. Run the command `npm i`
3. Run the command `npm run watch`
4. Open a new console/terminal in the repo's root directory
5. Run the command `docker-compose -f ./docker/docker-compose.dev.yml up`
6. Run the MySQL migrations with `npm run migrations-dev -- up`, from the `webserver` directory

**NOTES**

. A test client application is available, in the `webserver/client_app.js` file, which allows an easy way to interact with the API. You can run this client via NodeJS environment.