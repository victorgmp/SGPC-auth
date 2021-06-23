import * as _ from 'lodash';
import {
  EventHandlerBase,
  ServiceResources,
} from 'polymetis-node';
import { TOPICS } from '../../submodule/events';

export default class Handler extends EventHandlerBase {
  public topic = TOPICS.AUTH.SIGNED.UP;

  constructor(resources: ServiceResources) {
    super(resources);
  }

  // eslint-disable-next-line max-len
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/explicit-module-boundary-types
  protected async handleCallback(data: any): Promise<void> {
    // eslint-disable-next-line no-useless-return
    return;
  }
}
