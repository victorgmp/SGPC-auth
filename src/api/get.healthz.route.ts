import * as _ from 'lodash';
import {
  Request,
  Response,
  RouteBaseTrustedMethods,
  ServiceResources,
} from 'polymetis-node';
import CustomApiRoute from '../submodule/lib/CustomApiRoute';

export default class ApiRouteImpl extends CustomApiRoute {
  public method: RouteBaseTrustedMethods = 'get';
  public url = '/healthz';

  constructor(resources: ServiceResources) {
    super(resources);
  }

  // eslint-disable-next-line class-methods-use-this
  public async callback(req: Request, res: Response): Promise<any> {
    res.sendStatus(200);
  }
}
