import * as _ from 'lodash';
import {
  Request,
  Response,
  RouteBaseTrustedMethods,
  ServiceResources,
} from 'polymetis-node';
import RefreshTokenService from '../service/refresh-token';
import AuthService from '../service';
import Errors from '../submodule/errors';
import CustomApiRoute from '../submodule/lib/CustomApiRoute';

export default class ApiRouteImpl extends CustomApiRoute {
  public method: RouteBaseTrustedMethods = 'post';
  public url = '/refresh-token';

  constructor(resources: ServiceResources) {
    super(resources);
  }

  // eslint-disable-next-line consistent-return
  public async callback(req: Request, res: Response): Promise<any> {
    const userId: string | null = _.get(req.body, 'userId', null);
    let refreshToken: string | null = _.get(req.body, 'refreshToken', null);

    if (
      !_.isString(userId)
      || !_.isString(refreshToken)
    ) {
      return this.throwError(400, Errors.BAD_REQUEST);
    }

    const authService = new AuthService(this.resources);
    const refreshTokenService = new RefreshTokenService(this.resources);

    // get user RPC to user service
    let token: string;
    try {
      await refreshTokenService.getByUserIdAndToken(userId, refreshToken);
      await refreshTokenService.deleteByUserIdAndToken(userId, refreshToken);
      refreshToken = await refreshTokenService.generateRefreshToken(userId);
      token = await authService.generateAccessToken({ userId });
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

    res.json({ token, refreshToken, auth: { userId } });
  }
}
