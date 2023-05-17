import express from 'express';
import {authenticate_petpooja} from '../../../utilities/jwt/authenticate';
import petpooja_routes from '../petpooja';

const callback_routes = express.Router();

callback_routes.use(
  '/petpooja',
  authenticate_petpooja,
  petpooja_routes.petpooja_routes
);

export default {callback_routes};
