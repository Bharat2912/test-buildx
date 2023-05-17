import Joi from 'joi';

export const lat_long = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
});
export const location_joi = Joi.object({
  start: lat_long.required(),
  end: lat_long.required(),
});
export const gdm_location_joi = Joi.object({
  origin: Joi.string().required(),
  destination: Joi.string().required(),
});

export const matrix_location_joi = Joi.object({
  coordinates: Joi.string().required(),
  origins: Joi.string().required(),
  destinations: Joi.string().required(),
});
