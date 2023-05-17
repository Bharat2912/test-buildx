import express from 'express';
import shadowfax from './delivery/shadowfax';
import rider from './delivery/rider';
import cashfree from './cashfree/index';
import {
  authenticate_admin,
  authenticate_rider,
  authenticate_shadowfax,
} from '../../../utilities/jwt/authenticate';

const callback_routes = express.Router();

callback_routes.use(
  '/shadowfax',
  authenticate_shadowfax,
  shadowfax.shadowfax_routes
);
callback_routes.use(
  '/admin/shadowfax',
  authenticate_admin,
  shadowfax.admin_routes
);
callback_routes.use('/rider', authenticate_rider, rider.rider_routes);
callback_routes.use('/cashfree', cashfree.cashfree_routes);

export default {callback_routes};
