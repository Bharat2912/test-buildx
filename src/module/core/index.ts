import express from 'express';
import {
  authenticate_admin,
  authenticate_user,
  authenticate_admin_serviceability,
  authenticate_partner,
} from '../../utilities/jwt/authenticate';
import polygon_routes from './polygon';
import service_routes from './service';
import common_routes from './common';
import banner_routes from './banner';
import city_routes from './city';
import verify_routes from './verify';
import delivery_routes from './delivery';
import payment_routes from './payment';
import payout_routes from './payout';
//import language_routes from './language';
import document_routes from './document';
import callback_routes from './callback';
import maps_routes from './maps';
import {getIfscCodeBankname} from '../../utilities/ifsc_bankname';
import subscription_routes from './subscription';
const routes = express.Router();
const internal_routes = express.Router();

routes.use('/maps', authenticate_user, maps_routes.user_routes);
routes.use('/admin/maps', authenticate_admin, maps_routes.admin_routes);
internal_routes.use('/maps', maps_routes.internal_routes);

routes.use('/admin/service', authenticate_admin, service_routes.admin_routes);

internal_routes.use('/polygon', polygon_routes.internal_routes);
routes.use(
  '/partner/polygon',
  authenticate_partner,
  polygon_routes.partner_routes
);
routes.use(
  '/admin/polygon',
  authenticate_admin,
  authenticate_admin_serviceability,
  polygon_routes.admin_routes
);

internal_routes.use('/verify', verify_routes.internal_routes);
internal_routes.use('/delivery', delivery_routes.internal_routes);
routes.use('/admin/delivery', authenticate_admin, delivery_routes.admin_routes);
internal_routes.use('/payment', payment_routes.internal_routes);
internal_routes.use('/payout', payout_routes.internal_routes);
internal_routes.use('/getIfscCodeBankname/:ifsc_code', getIfscCodeBankname);
internal_routes.use('/subscription', subscription_routes.internal_routes);

routes.use('/admin/banner', authenticate_admin, banner_routes.admin_routes);
routes.use('/banner', banner_routes.customer_routes);

internal_routes.use('/city', city_routes.internal_routes);
routes.use('/admin/city', authenticate_admin, city_routes.admin_routes);
routes.use('/partner/city', authenticate_partner, city_routes.partner_routes);

// internal_routes.use('/language', language_routes.internal_routes);
// routes.use('/admin/language', authenticate_admin, language_routes.admin_routes);
// routes.use(
//   '/partner/language',
//   authenticate_partner,
//   language_routes.partner_routes
// );

routes.use('/admin/document', authenticate_admin, document_routes.admin_routes);
routes.use(
  '/partner/document',
  authenticate_partner,
  document_routes.partner_routes
);

routes.use('/service', service_routes.customer_routes);
routes.use('/common', authenticate_user, common_routes.user_routes);

routes.use('/callback', callback_routes.callback_routes);

export {routes, internal_routes};
