import { ServiceResources } from 'polymetis-node';
import AuthRPC from './auth';
import UserRPC from './user';
import TaskRPC from './task';

export default class RPCService {
  public auth: AuthRPC;
  public user: UserRPC;
  public task: TaskRPC;

  constructor(protected resources: ServiceResources) {
    this.auth = new AuthRPC(resources);
    this.user = new UserRPC(resources);
    this.task = new TaskRPC(resources);
  }
}
