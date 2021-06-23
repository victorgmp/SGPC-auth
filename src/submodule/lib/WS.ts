import {
  Base,
} from 'polymetis-node';
import { IWSMessage } from '../core/model';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function broadcast(base: Base, topic: string, payload: unknown, userId?: string) {
  const message: IWSMessage = {
    userId,
    topic,
    payload,
  };
  await base.emitEvent('ws.message.prepared', message);
}

export {
  // eslint-disable-next-line import/prefer-default-export
  broadcast,
};
