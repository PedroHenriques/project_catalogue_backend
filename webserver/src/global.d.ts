import { ISession } from './interfaces/data';

declare global {
  namespace Express {
    interface Request {
      session?: ISession,
    }
  }
}

export {};