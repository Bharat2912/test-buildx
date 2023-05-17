import express from 'express';
import {routes as core_routes, internal_routes} from './core';
import food_routes from './food';

const routes = express();

routes.use('/food', food_routes);
routes.use('/core', core_routes);
routes.use('/internal', internal_routes);

export default routes;
