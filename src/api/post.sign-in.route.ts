import * as _ from 'lodash';
import {
  Request,
  Response,
  RouteHandlerBase,
  RouteBaseTrustedMethods,
  ServiceResources,
} from 'polymetis-node';
import AuthService from '../service';
import RefreshTokenService from '../service/refresh-token';
import Errors from '../submodule/errors';
import RPCService from '../submodule/rcp';
import { IAuth, IUser } from '../submodule/core/model';
import { TOPICS } from '../submodule/events';

export default class ApiRouteImpl extends RouteHandlerBase {
  public method: RouteBaseTrustedMethods = 'post';
  public url = '/sign-in';

  constructor(resources: ServiceResources) {
    super(resources);
  }

  // eslint-disable-next-line consistent-return
  public async callback(req: Request, res: Response): Promise<any> {
    const username: string | null = _.get(req.body, 'username', null);
    const password: string | null = _.get(req.body, 'password', null);

    if (
      !_.isString(username)
      || !_.isString(password)
    ) {
      return this.throwError(400, Errors.BAD_REQUEST);
    }

    const authService = new AuthService(this.resources);
    const refreshTokenService = new RefreshTokenService(this.resources);

    // get user RPC to user service
    const rpcService = new RPCService(this.resources);
    let user: IUser;
    let refreshToken: string;
    let auth: { auth: IAuth; token: string; };
    try {
      user = await rpcService.user.user.getByUsername(username);
      auth = await authService.signIn(user.id, password);
      refreshToken = await refreshTokenService.generateRefreshToken(user.id);
    } catch (error) {
      switch (error.message) {
        case Errors.USER.USER_NOT_FOUND:
        case Errors.AUTH.USER_NOT_FOUND:
        case Errors.AUTH.INVALID_PASSWORD:
          return this.throwError(401, Errors.UNAUTHORIZED);
        default:
          return this.throwError(500, Errors.INTERNAL_ERROR);
      }
    }

    this.emitEvent(TOPICS.AUTH.SIGNED.IN, { userId: user.id });
    res.json({ refreshToken, token: auth.token, auth: auth.auth });
  }
}
