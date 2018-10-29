'use strict';

export interface ISession {
  userId: string,
}

export interface ISessionData {
  userId: string,
  createdAt: number,
}

export interface IUserAccountConfig {
  domain: { [key: string]: string },
  accountRegistration: {
    tokenDurationInSeconds: number,
    email: {
      from: {
        name: string,
        address: string,
      },
      subject: string,
      body: {
        plain: string,
        html: string,
      },
    },
    activationRelUrl: string,
  },
  accountActivation: {
    email: {
      from: {
        name: string,
        address: string,
      },
      subject: string,
      body: {
        plain: string,
        html: string,
      },
    },
    loginRelUrl: string,
  },
  login: {
    sessionDurationInSeconds: number,
    cookieName: string,
  },
  lostPassword: {
    tokenDurationInSeconds: number,
    email: {
      from: {
        name: string,
        address: string,
      },
      subject: string,
      body: {
        plain: string,
        html: string,
      },
    },
    pwResetRelUrl: string,
  },
  resetPassword: {
    email: {
      from: {
        name: string,
        address: string,
      },
      subject: string,
      body: {
        plain: string,
        html: string,
      },
    },
  },
}

export interface IUsersPendingActivation {
  token: string,
  pwHash: string,
  name: string,
}

export interface IPasswordsPendingReset {
  token: string,
}

export interface IUserTableRow {
  id?: number,
  email: string,
  password: string,
  name: string,
  createdAt?: string,
  updatedAt?: string,
}

export interface IProperty {
  id: number,
  title: string,
  numberOfBeds: number,
  address: string,
  geoLocationLat: number,
  geoLocationLong: number,
  description: string | null,
  propertyType: string,
  country: string,
}

export interface IPropertyTableRow {
  id?: number,
  title: string,
  numberOfBeds: number,
  address: string,
  geoLocationLat: number,
  geoLocationLong: number,
  description: string | null,
  typeId: number,
  countryId: number,
}

export interface IUsersPropertiesTable {
  userId: number,
  propertyId: number,
  createdAt?: string,
  updatedAt?: string,
}