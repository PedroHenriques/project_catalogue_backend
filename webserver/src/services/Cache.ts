'use strict';
import { promisify } from 'util';
import { createClient } from 'redis';

const redisConOptions = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

const redisClient = createClient(redisConOptions);
const redisAsync = {
  del: promisify(redisClient.del).bind(redisClient),
  exists: promisify(redisClient.exists).bind(redisClient),
  get: promisify(redisClient.get).bind(redisClient),
  set: promisify(redisClient.set).bind(redisClient),
  setnx: promisify(redisClient.setnx).bind(redisClient),
  expire: promisify(redisClient.expire).bind(redisClient),
};

class Cache {
  public delKey = (key: string): Promise<number> => redisAsync.del(key);

  public keysExist = (keys: string[]): Promise<boolean> =>
    redisAsync.exists(keys)
    .then((numKeysFound: number) => keys.length === numKeysFound)

  public getValue = (key: string): Promise<string|null> => redisAsync.get(key);

  public storeValue = (key: string, value: string): Promise<boolean> =>
    redisAsync.set(key, value)
    .then((reply: string) => reply === 'OK')

  public setObject = (key: string, value: Object): Promise<boolean> =>
    this.storeValue(key, JSON.stringify(value))

  public setObjectIfNotExists = (
      key: string, value: Object
  ): Promise<boolean> => redisAsync.setnx(key, JSON.stringify(value))

  public getObject = (key: string): Promise<Object> => this.getValue(key)
    .then(value => {
      if (value === null) { return({}); }
      return(JSON.parse(value));
    })

  public expireKey = (key: string, numSec: number): Promise<boolean> =>
    redisAsync.expire(key, numSec)
}

const cache = new Cache();
export default cache;