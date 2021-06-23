/* eslint-disable max-classes-per-file */
import * as _ from 'lodash';
import { MongoClient, Db, ObjectId } from 'mongodb';
import { ServiceResources } from 'polymetis-node';

export interface MongoConfiguration {
  auth?: {
    user?: string;
    password?: string;
  };
  host?: string;
  port?: number;
  dbName?: string;
}

export const mongoConf: MongoConfiguration = {
  auth: {
    user: _.get(process.env, 'MONGO_USERNAME'),
    password: _.get(process.env, 'MONGO_PASSWORD'),
  },
  host: _.get(process.env, 'MONGO_HOST'),
  port: _.toNumber(_.get(process.env, 'MONGO_PORT')),
  dbName: _.get(process.env, 'MONGO_DATABASE'),
};

export class Client {
  static client: MongoClient;
  static database: Db;

  public static async connect(resources: ServiceResources): Promise<boolean> {
    if (
      Client.client
      && Client.database
      && Client.client.isConnected()
    ) {
      return;
    }

    try {
      const url = `mongodb://${mongoConf.auth.user}:${mongoConf.auth.password}@${mongoConf.host}:${mongoConf.port}/${mongoConf.dbName}`;

      Client.client = new MongoClient(url, { useUnifiedTopology: true });
      await Client.client.connect();

      Client.database = Client.client.db(mongoConf.dbName);
    } catch (error) {
      resources.logger.error('Unable to connect to MongoDB', error.message);
      throw new Error('Unable to connect to MongoDB');
    }
  }
}

interface MongoObjectGeneric {
  _id: string;
  createdAt: number;
  updatedAt: number;
}
interface MongoObjectPublicGeneric {
  id: string;
}

export abstract class ModelBase<T extends MongoObjectPublicGeneric, K extends MongoObjectGeneric> {
  public collection: string;
  constructor(
    public readonly collectionName: string,
    public resources: ServiceResources,
  ) {
    this.collection = `${resources.configuration.service.environment}_${resources.configuration.service.service}_${collectionName}`;
  }

  async create(obj: T): Promise<T> {
    try {
      const tmpObj = this.fromPublic(obj);

      await Client.connect(this.resources);
      const collection = Client.database.collection(this.collection);

      const { insertedId } = await collection.insertOne(
        {
          ...tmpObj,
          _id: `${this.collectionName}_${_.toString(new ObjectId())}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      );

      // eslint-disable-next-line no-underscore-dangle
      tmpObj._id = insertedId;
      return this.toPublic(tmpObj);
    } catch (error) {
      this.resources.logger.error(this.collection, error.message, error);
      throw Error(`Error create ${this.collection}`);
    }
  }

  async update(obj: T): Promise<T> {
    try {
      const tmpObj = this.fromPublic(obj);

      await Client.connect(this.resources);
      const collection = Client.database.collection(this.collection);

      const { modifiedCount } = await collection.updateOne(
        // eslint-disable-next-line no-underscore-dangle
        { _id: tmpObj._id },
        {
          $set: {
            ...tmpObj,
            updatedAt: Date.now(),
          },
        },
        { upsert: false },
      );

      if (modifiedCount === 0) throw new Error('Not found');

      return this.toPublic(tmpObj);
    } catch (error) {
      this.resources.logger.error(this.collection, error.message, error);
      throw Error(`Error update ${this.collection}`);
    }
  }

  async getOne(id: string): Promise<T> {
    try {
      await Client.connect(this.resources);
      const collection = Client.database.collection(this.collection);

      const result = await collection.findOne(
        { _id: id },
      );

      return this.toPublic(result);
    } catch (error) {
      this.resources.logger.error(this.collection, error.message, error);
      throw Error(`Error getOne ${this.collection}`);
    }
  }

  async getByIds(ids: string[]): Promise<T[]> {
    try {
      await Client.connect(this.resources);
      const collection = Client.database.collection(this.collection);

      const result = await collection.find(
        { _id: { $in: ids } },
      ).toArray();

      return result.map(this.toPublic);
    } catch (error) {
      this.resources.logger.error(this.collection, error.message, error);
      throw Error(`Error getByIds ${this.collection}`);
    }
  }

  async getAll(query: any = {}, options: any = {}): Promise<T[]> {
    try {
      await Client.connect(this.resources);
      const collection = Client.database.collection(this.collection);

      const result = await collection.find(
        { ...query },
        { ...options },
      ).toArray();

      return result.map(this.toPublic);
    } catch (error) {
      this.resources.logger.error(this.collection, error.message, error);
      throw Error(`Error getAll ${this.collection}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await Client.connect(this.resources);
      const collection = Client.database.collection(this.collection);

      const { deletedCount } = await collection.deleteOne(
        { _id: id },
      );

      if (deletedCount === 0) throw new Error('Mongo Delete Error: Not found');

      return;
    } catch (error) {
      this.resources.logger.error(this.collection, error.message, error);
      throw Error(`Error delete ${this.collection}`);
    }
  }

  async deleteByIds(ids: string[]): Promise<void> {
    try {
      await Client.connect(this.resources);
      const collection = Client.database.collection(this.collection);

      const { deletedCount } = await collection.deleteMany(
        { _id: { $in: ids } },
      );

      if (deletedCount === 0) throw new Error('Mongo Delete Error: Not found');
      return;
    } catch (error) {
      this.resources.logger.error(this.collection, error.message, error);
      throw Error(`Error deleteByIds ${this.collection}`);
    }
  }

  public abstract fromPublic(obj: T): K;
  public abstract toPublic(obj: K): T;
}
