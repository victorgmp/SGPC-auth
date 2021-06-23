/* eslint-disable class-methods-use-this */
import _ from 'lodash';
import { ServiceResources } from 'polymetis-node';
import { ModelBase, Client } from '../submodule/lib/Mongo';

export enum IRefreshTokenStatus {
  'active' = 'active',
  'deleted' = 'deleted',
}
export interface IRefreshTokenInternal {
  _id: string;
  userId: string;
  token: string;
  status: IRefreshTokenStatus;
  createdAt: number;
  updatedAt: number;
}

export interface IRefreshTokenExternal {
  id: string;
  userId: string;
  token: string;
  status: IRefreshTokenStatus;
  createdAt: number;
  updatedAt: number;
}

// eslint-disable-next-line max-len
export default class RefreshTokenModel extends ModelBase<IRefreshTokenExternal, IRefreshTokenInternal> {
  constructor(resources: ServiceResources) {
    super('refresh_token', resources);
  }

  public toPublic(obj: IRefreshTokenInternal): IRefreshTokenExternal {
    return {
      // eslint-disable-next-line no-underscore-dangle
      id: obj._id ? obj._id : null,
      userId: obj.userId,
      token: obj.token,
      status: obj.status,
      createdAt: new Date((obj.createdAt || new Date())).getTime(),
      updatedAt: new Date((obj.updatedAt || new Date())).getTime(),
    };
  }

  public fromPublic(obj: IRefreshTokenExternal): IRefreshTokenInternal {
    return {
      _id: obj.id ? obj.id : null,
      userId: obj.userId,
      token: obj.token,
      status: obj.status,
      createdAt: new Date((obj.createdAt || new Date())).getTime(),
      updatedAt: new Date((obj.updatedAt || new Date())).getTime(),
    };
  }

  public async getByUserIdAndToken(
    userId: string,
    token: string,
  ): Promise<IRefreshTokenExternal | null> {
    try {
      await Client.connect(this.resources);
      const collection = Client.database.collection(this.collection);

      const auth = await collection.findOne(
        {
          userId,
          token,
          status: {
            $nin: [
              IRefreshTokenStatus.deleted,
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

  public async deleteByUserIdAndToken(
    userId: string,
    token: string,
  ): Promise<void> {
    try {
      await Client.connect(this.resources);
      const collection = Client.database.collection(this.collection);

      const { deletedCount } = await collection.deleteOne(
        {
          userId,
          token,
        },
      );

      if (deletedCount === 0) throw new Error('Mongo Delete Error: Not found');

      return;
    } catch (error) {
      this.resources.logger.error(this.collection, error.message, error);
      throw Error(`Error delete ${this.collection}`);
    }
  }
}
