/* eslint-disable class-methods-use-this */
import _ from 'lodash';
import { ServiceResources } from 'polymetis-node';

import { ModelBase, Client } from '../submodule/lib/Mongo';

export { IAuth } from '../submodule/core/model';

export enum IAuthStatus {
  'active' = 'active',
  'inactive' = 'inactive',
  'deleted' = 'deleted',
}
export interface IAuthInternal {
  _id: string;
  userId: string;
  passwordHash: string;
  salt: string;
  status: IAuthStatus;
  createdAt: number;
  updatedAt: number;
}

export interface IAuthExternal {
  id: string;
  userId: string;
  passwordHash: string;
  salt: string;
  status: IAuthStatus;
  createdAt: number;
  updatedAt: number;
}

export default class AuthModel extends ModelBase<IAuthExternal, IAuthInternal> {
  constructor(resources: ServiceResources) {
    super('auth', resources);
  }

  public toPublic(obj: IAuthInternal): IAuthExternal {
    return {
      // eslint-disable-next-line no-underscore-dangle
      id: obj._id ? obj._id : null,
      userId: obj.userId,
      passwordHash: obj.passwordHash,
      salt: obj.salt,
      status: obj.status,
      createdAt: new Date((obj.createdAt || new Date())).getTime(),
      updatedAt: new Date((obj.updatedAt || new Date())).getTime(),
    };
  }

  public fromPublic(obj: IAuthExternal): IAuthInternal {
    return {
      _id: obj.id ? obj.id : null,
      userId: obj.userId,
      passwordHash: obj.passwordHash,
      salt: obj.salt,
      status: obj.status,
      createdAt: new Date((obj.createdAt || new Date())).getTime(),
      updatedAt: new Date((obj.updatedAt || new Date())).getTime(),
    };
  }

  public async getByUserId(
    userId: string,
  ): Promise<IAuthExternal | null> {
    try {
      await Client.connect(this.resources);
      const collection = Client.database.collection(this.collection);

      const auth = await collection.findOne(
        {
          userId,
          status: {
            $nin: [
              IAuthStatus.deleted,
            ],
          },
        },
      );

      if (!auth) {
        return null;
      }

      return this.toPublic(auth);
    } catch (error) {
      this.resources.logger.error(this.collection, error.message, error);
      throw error;
    }
  }

  public async getByUserIds(
    userIds: string[],
  ): Promise<IAuthExternal[]> {
    try {
      await Client.connect(this.resources);
      const collection = Client.database.collection(this.collection);

      const result = await collection.find(
        {
          userId: { $in: userIds },
          status: {
            $nin: [
              IAuthStatus.deleted,
            ],
          },
        },
      ).toArray();

      return result.map(this.toPublic);
    } catch (error) {
      this.resources.logger.error(this.collection, error.message, error);
      throw error;
    }
  }

  public async deleteByUserId(userId: string): Promise<void> {
    try {
      await Client.connect(this.resources);
      const collection = Client.database.collection(this.collection);

      const { deletedCount } = await collection.deleteOne(
        { userId },
      );

      if (deletedCount === 0) throw new Error('Mongo Delete Error: Not found');

      return;
    } catch (error) {
      this.resources.logger.error(this.collection, error.message, error);
      throw Error(`Error delete ${this.collection}`);
    }
  }
}
