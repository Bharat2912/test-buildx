import Joi from 'joi';
export const verify_mark_complete = Joi.object({
  transaction_details: Joi.object(),
  payout_completed_time: Joi.date().required(),
});

export const verify_filter_payout = Joi.object({
  search_text: Joi.string().max(200),
  filter: Joi.object({
    status: Joi.array().items(
      Joi.valid('INIT', 'FAILED', 'PENDING', 'COMPLETE', 'REJECTED', 'REVERSED')
    ),
    start_date: Joi.date(),
    end_date: Joi.date(),
    amount_gt: Joi.number().min(10),
    amount_lt: Joi.number().min(10),
    retry: Joi.boolean(),
    completed_by_admin: Joi.boolean(),
    in_csv: Joi.boolean(),
  }),
  sort_by: Joi.object({
    column: Joi.valid('created_at', 'amount').required(),
    direction: Joi.valid('asc', 'desc'),
  }),
  pagination: Joi.object({
    page_index: Joi.number().required(),
    page_size: Joi.number().min(1).required(),
  }).required(),
});

export const verify_summary_payout = Joi.object({
  duration: Joi.valid('today', 'week', 'month', 'year'),
  start_date: Joi.date(),
  end_date: Joi.date(),
});
