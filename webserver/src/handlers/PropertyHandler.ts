'use strict';
import { Request, Response } from 'express';
import { runQuery } from '../services/Mysql';
import { IProperty } from '../interfaces/data';

export default class PropertyHandler {
  public findAll = async (req: Request, res: Response): Promise<Response> => {
    const userId = '1';

    const properties = await runQuery({
      statement: `SELECT p.title, p.numberOfBeds, p.address, p.geoLocation,
        p.description, pt.name as propertyType, c.name as country
        FROM properties as p
        LEFT JOIN usersProperties as up ON up.propertyId=p.id AND up.userId = ?
        LEFT JOIN propertyTypes as pt ON pt.id = p.typeId
        LEFT JOIN countries as c ON c.id = p.countryId`,
      bindValues: [ userId ],
    }) as IProperty[];

    return(res.status(200).json({ properties }));
  }
}