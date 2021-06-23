import * as _ from 'lodash';
import { ServiceResources, Base } from 'polymetis-node';

export default abstract class RPCBase extends Base {
  protected SERVICE_RPC_PROT: string;
  protected SERVICE_RPC_HOST: string;
  protected SERVICE_RPC_PORT: string;

  constructor(
    service: string,
    protected resources: ServiceResources,
  ) {
    super(resources);

    this.SERVICE_RPC_PROT = _.get(process.env, `SERVICE_${service.toUpperCase()}_RPC_PROT`, 'http');
    this.SERVICE_RPC_HOST = _.get(process.env, `SERVICE_${service.toUpperCase()}_RPC_HOST`, 'localhost');
    this.SERVICE_RPC_PORT = _.get(process.env, `SERVICE_${service.toUpperCase()}_RPC_PORT`, '8000');
  }

  protected async call<T>(procedure: string, data: any): Promise<T> {
    return await this.callRPC<T>(`${this.SERVICE_RPC_PROT}://${this.SERVICE_RPC_HOST}:${this.SERVICE_RPC_PORT}/${procedure}`, data);
  }
}
