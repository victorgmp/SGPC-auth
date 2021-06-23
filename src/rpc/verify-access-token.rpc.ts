import _ from 'lodash';
import { RPCHandlerBase } from 'polymetis-node';
import AuthService from '../service';
import { IAuth } from '../model/Auth';
import Errors from '../submodule/errors';

export default class RPCImpl extends RPCHandlerBase {
  public procedure = 'auth.verify-access-token';

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  protected async callback({ transactionId, payload }): Promise<IAuth> {
    const token = _.get(payload, 'token', '');

    if (_.isEmpty(token)) throw Error(Errors.AUTH.INVALID_ACCESS_TOKEN);
    if (!_.isString(token)) throw Error(Errors.AUTH.INVALID_ACCESS_TOKEN);

    const authService = new AuthService(this.resources);

    return authService.verifyAccessToken(token);
  }
}
