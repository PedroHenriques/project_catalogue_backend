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

. All emails sent will, in development mode, be sent to `http://localhost:8025`  
. A test client application is available, in the `webserver/client_app.js` file, which allows an easy way to interact with the API. You can run this client via NodeJS environment.

# API Endpoints

# v1

### POST `/api/v1/login/`

Authenticates a user and creates a session.

- **receives**
  - **type:** json
  - **parameters:** {  
      email: string,  
      password: string,  
    }

- **returns**
  - **type:** json
  - **format:** {}

### GET `/api/v1/logout/`

Logs out a user and deletes a session.

- **returns**
  - **type:** json
  - **format:** {}

### GET `/api/v1/properties/`

Fetch all properties.

- **returns**
  - **type:** json
  - **format:** {  
    properties: IProperty[]  
  }

### POST `/api/v1/properties/`

Create a new property.

- **receives**
  - **type:** json
  - **parameters:** {  
      title: string,  
      numberOfBeds: int,  
      address: string,  
      geoLocationLat: float,  
      geoLocationLong: float,  
      description?: string,  
      typeId: int,  
      countryId: int  
    }

- **returns**
  - **type:** json
  - **format:** {  
    property: IProperty  
  }

### GET `/api/v1/users/properties/`

Fetch all properties the logged in user owns.

- **returns**
  - **type:** json
  - **format:** {  
    properties: IProperty[]  
  }

### POST `/api/v1/users/`

Create a new user.

- **receives**
  - **type:** json
  - **parameters:** {  
      email: string,  
      password: string,  
      name: string,  
    }

- **returns**
  - **type:** json
  - **format:** {}

### POST `/api/v1/users/activate/`

Activate a user's account.

- **receives**
  - **type:** json
  - **parameters:** {  
      email: string,  
      token: string,  
    }

- **returns**
  - **type:** json
  - **format:** {}

### POST `/api/v1/users/lostPw/`

Start the password recovery process for a user's account.

- **receives**
  - **type:** json
  - **parameters:** {  
      email: string,  
    }

- **returns**
  - **type:** json
  - **format:** {}

### POST `/api/v1/users/pwReset/`

Change a user's account password to the provided one.

- **receives**
  - **type:** json
  - **parameters:** {  
      email: string,  
      token: string,  
      password: string,  
    }

- **returns**
  - **type:** json
  - **format:** {}