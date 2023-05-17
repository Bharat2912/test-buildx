import Joi from 'joi';

export const id = Joi.string()
  .guid({version: ['uuidv4', 'uuidv5']})
  .required();
