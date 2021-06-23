/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable arrow-body-style */
import { ServiceResources } from 'polymetis-node';
import RPCBase from '../.base';
import { IUser } from '../../core/model';

export default class UserRPC extends RPCBase {
  constructor(resources: ServiceResources) {
    super('user', resources);
  }

  user = {
    getById: async (id: string): Promise<IUser> => {
      return await this.call<IUser>('user.get-by-id', { id });
    },
    getByUsername: async (username: string): Promise<IUser> => {
      return await this.call<IUser>('user.get-by-username', { username });
    },
    create: async (username: string): Promise<IUser> => {
      return await this.call<IUser>('user.create', { username });
    },
  };
}
