'use strict';
import { Request, Response } from 'express';
import { runSingleQuery } from '../services/Mysql';
import { IProperty } from '../interfaces/data';

export default class PropertyHandler {
  public findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = '1';

      const statement: string = `
        SELECT p.title, p.numberOfBeds, p.address, p.geoLocation,
        p.description, pt.name as propertyType, c.name as country
        FROM properties as p
        LEFT JOIN usersProperties as up ON up.propertyId=p.id AND up.userId=?
        LEFT JOIN propertyTypes as pt ON pt.id=p.typeId
        LEFT JOIN countries as c ON c.id=p.countryId
      `;

      const properties = await runSingleQuery({
        query: {
          statement,
          bindValues: [ userId ],
        },
      }) as IProperty[];

      return(res.status(200).json({ properties }));
    } catch (error) {
      logger.error({
        message: error.message,
        payload: error,
      });

      return(res.status(500).json({
        error: 'Could not handle the request.',
      }));
    }
  }
}