'use strict';

export interface IProperty {
  title: string,
  numberOfBeds: number,
  address: string,
  geoLocation: number,
  description: string | null,
  propertyType: string,
  country: string,
}

export interface IPropertyTable {
  id?: number,
  title: string,
  numberOfBeds: number,
  address: string,
  geoLocation: number,
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