import {
  RouteHandlerBase,
  ServiceResources,
  Request,
} from 'polymetis-node';
import Errors from '../errors';
import RPCService from '../rcp';
import { TOPICS } from '../events';

export interface AuthTokenData {
  userId: string;
  roles: number[];
}

export default abstract class CustomApiRoute extends RouteHandlerBase {
  protected rpcService: RPCService;
  protected ERRORS = Errors;
  protected EVENT_TOPICS = TOPICS;

  constructor(resources: ServiceResources) {
    super(resources);
    this.rpcService = new RPCService(resources);
  }

  protected async requireAuthentication(req: Request): Promise<AuthTokenData> {
    // Requiring token in Authorization header in the format
    // Authorization: Bearer #accessToken#
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      this.throwError(401, 'No authorization header provided');
      return;
    }

    const authSplit = authHeader.split(' ');

    if (authSplit.length !== 2) {
      this.throwError(400, 'Malformed authentication header. \'Bearer accessToken\' syntax expected');
      return;
    }
    if (authSplit[0].toLowerCase() !== 'bearer') {
      this.throwError(400, '\'Bearer\' keyword missing from front of authorization header');
      return;
    }

    try {
      const token = authSplit[1];
      const auth = await this.rpcService.auth.auth.verifyAccessToken(token);
      // const decodedToken = await this.rpcService.auth.auth().verifyIdToken(token);

      if (!auth || !auth.userId) {
        this.throwError(400, 'Unable to decode JWT, refresh login and try again.');
        return;
      }
      // eslint-disable-next-line consistent-return
      return {
        userId: auth.userId,
        roles: [],
      } as AuthTokenData;
    } catch (error) {
      this.resources.logger.error(error);
      this.throwError(401, this.ERRORS.UNAUTHORIZED);
    }
  }
}
