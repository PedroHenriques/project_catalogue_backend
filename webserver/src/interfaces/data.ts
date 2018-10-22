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