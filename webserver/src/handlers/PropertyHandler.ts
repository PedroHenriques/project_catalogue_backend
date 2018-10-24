'use strict';
import { Request, Response } from 'express';
import * as SqlFacade from '../services/Mysql';
import logger from '../services/Logger';
import { Connection } from 'mysql';
import {
  IProperty, IPropertyTableRow, IUsersPropertiesTable
} from '../interfaces/data';

export default class PropertyHandler {
  public myProperties = async (
    req: Request, res: Response
  ): Promise<Response> => {
    try {
      if (req.session === undefined) {
        throw Error('Failed to create a property due to missing session data.');
      }
      const userId = req.session.userId;

      const statement: string = `
        SELECT p.id, p.title, p.numberOfBeds, p.address, p.geoLocationLat,
        p.geoLocationLong, p.description, pt.name as propertyType,
        c.name as country
        FROM properties as p
        LEFT JOIN usersProperties as up ON up.propertyId=p.id AND up.userId=?
        LEFT JOIN propertyTypes as pt ON pt.id=p.typeId
        LEFT JOIN countries as c ON c.id=p.countryId
      `;

      const properties = await SqlFacade.runSingleQuery({
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

  public findAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const statement: string = `
        SELECT p.id, p.title, p.numberOfBeds, p.address, p.geoLocationLat,
        p.geoLocationLong, p.description, pt.name as propertyType,
        c.name as country
        FROM properties as p
        LEFT JOIN usersProperties as up ON up.propertyId=p.id
        LEFT JOIN propertyTypes as pt ON pt.id=p.typeId
        LEFT JOIN countries as c ON c.id=p.countryId
      `;

      const properties = await SqlFacade.runSingleQuery({
        query: {
          statement,
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

  public create = async (req: Request, res: Response): Promise<Response> => {
    let dbConnection: Connection | undefined;
    try {
      if (req.session === undefined) {
        throw Error('Failed to create a property due to missing session data.');
      }
      const userId = req.session.userId;

      dbConnection = await SqlFacade.connect();
      await new Promise((resolve, reject) => {
        if (dbConnection === undefined) {
          return(reject(new Error('Failed to connect to the DB')));
        }

        dbConnection.beginTransaction(async error => {
          if (error) { return(reject(error)); }
          if (dbConnection === undefined) { return(reject()); }

          try {
            const property: IPropertyTableRow = {
              title: req.body.title,
              numberOfBeds: parseInt(req.body.numberOfBeds, 10),
              address: req.body.address,
              geoLocationLat: parseFloat(req.body.geoLocationLat),
              geoLocationLong: parseFloat(req.body.geoLocationLong),
              description: (req.body.description === undefined ||
                req.body.description === '') ? null : req.body.description,
              typeId: parseInt(req.body.typeId, 10),
              countryId: parseInt(req.body.countryId, 10),
            };

            const insertedProperty = await SqlFacade.query(
              dbConnection,
              {
                statement: `INSERT INTO properties SET ?`,
                bindValues: [ property ],
              }
            );

            const userProperty: IUsersPropertiesTable = {
              userId: parseInt(userId, 10),
              propertyId: insertedProperty.insertId,
            };

            await SqlFacade.query(
              dbConnection,
              {
                statement: 'INSERT INTO usersProperties SET ?',
                bindValues: [ userProperty ],
              }
            );

            dbConnection.commit();

            resolve();
          } catch (error) {
            dbConnection.rollback();
            reject(error);
          }
        });
      });

      return(res.status(201).json({}));
    } catch (error) {
      logger.error({
        message: error.message,
        payload: error,
      });

      return(res.status(500).json({
        error: 'Could not handle the request.',
      }));
    } finally {
      if (dbConnection) { dbConnection.end(); }
    }
  }
}