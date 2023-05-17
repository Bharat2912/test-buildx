import express from 'express';
import * as controller from './controller';

const internal_routes = express.Router();

internal_routes.get('/postalCode/:postal_code', controller.verifyPostalCode);
internal_routes.get('/fssai/:fssai', controller.verifyFssai);
internal_routes.get('/panNumber/:pan_number', controller.verifyPanNumber);
internal_routes.get('/gstinNumber/:gstin_number', controller.verifyGstinNumber);
internal_routes.get('/ifscCode/:ifsc_code', controller.verifyIfscCode);
export default {internal_routes};
