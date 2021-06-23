import * as _ from 'lodash';
import { ServiceBase } from 'polymetis-node';
import * as bodyParser from 'body-parser';
import cors from 'cors';
import CustomApiRoute from './CustomApiRoute';

type ApiRouteClass = typeof CustomApiRoute;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomApiRouteImpl extends ApiRouteClass {}

export default class APILoader {
  constructor(protected service: ServiceBase) { }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async loadRoutes(routes: CustomApiRouteImpl[]) {
    this.service.apiApp.use(bodyParser.json());
    this.service.apiApp.use(bodyParser.urlencoded({ extended: false }));
    this.service.apiApp.use(cors());

    let routeInstance: CustomApiRoute;
    // eslint-disable-next-line no-restricted-syntax
    for (const route of routes) {
      // eslint-disable-next-line new-cap
      routeInstance = new route(this.service.resources);
      // eslint-disable-next-line no-await-in-loop
      await this.service.loadRoute(routeInstance);
    }
    await this.service.startAPI();
  }
}
