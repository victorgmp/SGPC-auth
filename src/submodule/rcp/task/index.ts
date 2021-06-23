import { ServiceResources } from 'polymetis-node';
import RPCBase from '../.base';
import { IUser } from '../../core/model';

export default class TaskRPC extends RPCBase {
  constructor(resources: ServiceResources) {
    super('Task', resources);
  }

  user = {
  };
}
