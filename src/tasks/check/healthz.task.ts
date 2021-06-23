import * as _ from 'lodash';
import {
  ServiceResources,
  TaskHandlerBase,
} from 'polymetis-node';

export default class Handler extends TaskHandlerBase {
  public topic = 'check.healthz';

  constructor(resources: ServiceResources) {
    super(resources);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  protected async handleCallback(data: any): Promise<void> {
    this.resources.logger.info('Healthz checked');

    await this.emitEvent(
      'healthz.checked',
      {
        service: this.resources.configuration.service.service,
      },
    );
  }
}
