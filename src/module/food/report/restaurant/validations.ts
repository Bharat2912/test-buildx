import {SalesFilterDurationStatus} from './enums';
import Joi from 'joi';

export const verify_sales_request = Joi.object({
  duration: Joi.string()
    .valid(
      SalesFilterDurationStatus.TODAY,
      SalesFilterDurationStatus.THIS_WEEK,
      SalesFilterDurationStatus.THIS_MONTH,
      SalesFilterDurationStatus.CUSTOM_RANGE
    )
    .required(),
  start_epoch: Joi.number().when('duration', {
    is: Joi.string().valid(SalesFilterDurationStatus.CUSTOM_RANGE),
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  end_epoch: Joi.number().when('duration', {
    is: Joi.string().valid(SalesFilterDurationStatus.CUSTOM_RANGE),
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});
