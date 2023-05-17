import logger from '../../../utilities/logger/winston_logger';
import {DB} from '../../../data/knex';
import {
  ICreatePlan,
  IFilterPlan,
  IFilterSubscription,
  IFilterSubscriptionPaymentAsAdmin,
  IPlan,
  IStaleSubscription,
  ISubscription,
  ISubscriptionAndRestaurantStats,
  IFilterSubscriptionDetails,
  ISubscriptionPayment,
  IUpdatePlan,
  IFilterSubscriptionPaymentDetails,
  IPaidSubscriptionsForOnHold,
} from './types';
import {
  PlanTable,
  READ_STALE_SUBSCRIPTIONS_SQL_QUERY,
  READ_SUBSCRIPTION_AND_RES_SUBSCRIPTION_SQL_QUERY,
  SubscriptionPaymentTable,
  SubscriptionTable,
  SUBSCRIPTION_WITH_CURRENT_AND_NEXT_PAYMENT,
} from './constants';
import {OrderByColumn, SortOrder} from '../../../enum';
import {Knex} from 'knex';
import {PlanType, SubscriptionPaymentStatus, SubscriptionStatus} from './enum';
import moment from 'moment';
import Globals from '../../../utilities/global_var/globals';

export async function insertPlan(plan: ICreatePlan): Promise<string> {
  logger.debug('creating subscription plan', plan);
  return await DB.write(PlanTable.TableName)
    .insert(plan)
    .returning('id')
    .then((plan: IPlan[]) => {
      logger.debug('subscription plan created', {plan_id: plan[0].id});
      return plan[0].id;
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE CREATING A SUBSCRIPTION PLAN', error);
      throw error;
    });
}

export async function updatePlan(
  trx: Knex.Transaction,
  plan: IUpdatePlan
): Promise<IPlan> {
  return await DB.write(PlanTable.TableName)
    .update(plan)
    .returning('*')
    .where('id', plan.id)
    .transacting(trx)
    .then((updated_plan: IPlan[]) => {
      logger.debug('subscription plan updated', {plan_id: updated_plan[0].id});
      return updated_plan[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE UPDATING A SUBSCRIPTION PLAN', error);
      throw error;
    });
}

export async function readPlanForUpdate(
  trx: Knex.Transaction,
  plan_id: string
): Promise<IPlan> {
  return await DB.write
    .select('*')
    .from(PlanTable.TableName)
    .where({id: plan_id})
    .forUpdate()
    .transacting(trx)
    .then((plan: IPlan[]) => {
      return plan[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE READING A PLAN FOR UPDATE', error);
      throw error;
    });
}

export async function readPlan(plan_id: string): Promise<IPlan> {
  return await DB.read
    .select('*')
    .from(PlanTable.TableName)
    .where({id: plan_id})
    .then((plan: IPlan[]) => {
      return plan[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE READING A PLAN', error);
      throw error;
    });
}

export async function readActivePlan(plan_id: string): Promise<IPlan> {
  return await DB.read
    .select('*')
    .from(PlanTable.TableName)
    .where({id: plan_id, active: true})
    .then((plan: IPlan[]) => {
      return plan[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE READING A PLAN', error);
      throw error;
    });
}

export async function filterPlans(params: IFilterPlan): Promise<{
  total_records: number;
  total_pages: number;
  records: IPlan[];
}> {
  const {search_text, filter, pagination, sort} = params;

  let DBQuery = DB.read.from(PlanTable.TableName);

  if (filter) {
    if (filter.plan_id) {
      DBQuery = DBQuery.where('id', filter.plan_id);
    }

    if (filter.active) {
      DBQuery = DBQuery.where('active', filter.active);
    }

    if (filter.type) {
      DBQuery = DBQuery.whereIn('type', filter.type);
    }

    if (filter.category) {
      DBQuery = DBQuery.whereIn('category', filter.category);
    }

    if (filter.interval_type) {
      DBQuery = DBQuery.whereIn('interval_type', filter.interval_type);
    }

    if (filter.intervals) {
      DBQuery = DBQuery.whereRaw(`intervals <= ${filter.intervals}`);
    }

    if (filter.no_of_orders) {
      DBQuery = DBQuery.whereRaw(`no_of_orders <= ${filter.no_of_orders}`);
    }

    if (filter.amount) {
      DBQuery = DBQuery.whereRaw(`amount <= ${filter.amount}`);
    }

    if (filter.max_cycles) {
      DBQuery = DBQuery.whereRaw(`max_cycles <= ${filter.max_cycles}`);
    }

    if (filter.duration) {
      DBQuery = DBQuery.whereRaw(
        `created_at between to_timestamp(${filter.duration.start_date}) and to_timestamp(${filter.duration.end_date})`
      );
    }
  }

  if (search_text) {
    DBQuery = DBQuery.whereRaw(
      `name::character varying(20) LIKE '${search_text.split("'").join("''")}%'`
    );
  }

  const total_records = await DBQuery.clone().count('*');

  let page_size;
  let page_index;
  if (pagination) {
    page_size = pagination.page_size;
    page_index = pagination.page_index;
  } else {
    page_size = 10;
    page_index = 0;
  }
  const offset = page_index * page_size;
  DBQuery = DBQuery.offset(offset).limit(page_size);
  const total_pages = Math.ceil(total_records[0].count / page_size);

  if (sort) {
    DBQuery = DBQuery.orderBy(sort);
  } else {
    DBQuery = DBQuery.orderBy(OrderByColumn.CREATED_AT, SortOrder.DESCENDING);
  }

  const records: IPlan[] = await DBQuery.clone().select('*');

  logger.debug('filter plan sql query', DBQuery.toSQL().toNative());

  return {
    total_records: total_records[0].count,
    total_pages,
    records,
  };
}

export async function insertSubscription(
  subscription: ISubscription,
  trx?: Knex.Transaction
): Promise<ISubscription> {
  const query = DB.write(SubscriptionTable.TableName)
    .insert(subscription)
    .returning('*');

  if (trx) {
    query.transacting(trx);
  }
  return await query
    .then((subscription: ISubscription[]) => {
      logger.debug('subscription created', {
        subscription_id: subscription[0].id,
      });
      return subscription[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE CREATING A SUBSCRIPTION', error);
      throw error;
    });
}

export async function updateSubscription(
  trx: Knex.Transaction,
  subscription_id: string,
  subscription: ISubscription
): Promise<ISubscription> {
  return await DB.write(SubscriptionTable.TableName)
    .update(subscription)
    .returning('*')
    .where('id', subscription_id)
    .transacting(trx)
    .then((subscription: ISubscription[]) => {
      logger.debug('subscription updated', {
        subscription_id: subscription_id,
      });
      return subscription[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE UPDATING A SUBSCRIPTION', error);
      throw error;
    });
}

export async function filterSubscription(params: IFilterSubscription): Promise<{
  total_records: number;
  total_pages: number;
  records: IFilterSubscriptionDetails[];
}> {
  const {search_text, filter, pagination, sort} = params;

  const SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS =
    await Globals.SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS.get();

  let DBQuery = DB.read.from(`${SubscriptionTable.TableName} as s`);

  if (filter) {
    DBQuery.whereWrapped(function () {
      if (filter.status) {
        this.whereIn('s.status', filter.status);
      }

      if (filter.include_grace_period_subscription === true) {
        this.orWhereRaw(
          `(
            sr.subscription_id is not null
            and
            sr.subscription_end_time < CURRENT_TIMESTAMP
            and
            sr.subscription_grace_period_remaining_orders > 0
            and
            sr.subscription_end_time +
            interval '${SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS}' day > CURRENT_TIMESTAMP
            )
          `
        );
      }

      if (filter.authorization_status) {
        this.whereIn('s.authorization_status', filter.authorization_status);
      }

      if (filter.subscription_id) {
        this.where('s.id', filter.subscription_id);
      }

      if (filter.external_subscription_id) {
        this.where(
          's.external_subscription_id',
          filter.external_subscription_id
        );
      }

      if (filter.plan_id) {
        this.where('s.plan_id', filter.plan_id);
      }

      if (filter.mode) {
        this.where('s.mode', filter.mode);
      }

      if (filter.cancelled_by) {
        this.whereIn('s.cancelled_by', filter.cancelled_by);
      }

      if (filter.partner) {
        this.whereIn('s.partner', filter.partner);
      }

      if (filter.next_payment_on) {
        this.whereRaw(
          `s.next_payment_on::date = date '${moment
            .unix(filter.next_payment_on)
            .format('YYYY-MM-DD')}'`
        );
      }

      if (filter.duration) {
        // this.whereRaw(
        //   `s.created_at between to_timestamp(${filter.duration.start_date}) and to_timestamp(${filter.duration.end_date})`
        // );

        this.whereRaw(
          `s.start_time >= to_timestamp(${filter.duration.start_date}) and s.end_time <= to_timestamp(${filter.duration.end_date})`
        );
      }
    });

    if (filter.restaurant_id) {
      DBQuery = DBQuery.where('s.restaurant_id', filter.restaurant_id);
    }
  }

  if (search_text) {
    const updated_search_text = search_text.toLowerCase().split("'").join("''");
    DBQuery = DBQuery.whereRaw(
      `LOWER(r.name) LIKE '%${updated_search_text}%' OR LOWER(p.name) LIKE '%${updated_search_text}%'`
    );
  }

  DBQuery = DBQuery.join(`${PlanTable.TableName} as p`, 's.plan_id', 'p.id')
    .join('restaurant as r', 's.restaurant_id', 'r.id')
    .leftJoin('restaurant as sr', 's.id', 'sr.subscription_id')
    .joinRaw(`left join ${SubscriptionPaymentTable.TableName} as sp
      on
      (
        s.id = sp.subscription_id
        and
        (
          s.current_cycle = sp.cycle
          or
          sp.cycle is null
        )
      )
    `);

  const total_records = await DBQuery.clone().count('*');

  let page_size;
  let page_index;
  if (pagination) {
    page_size = pagination.page_size;
    page_index = pagination.page_index;
  } else {
    page_size = 10;
    page_index = 0;
  }
  const offset = page_index * page_size;
  DBQuery = DBQuery.offset(offset).limit(page_size);
  const total_pages = Math.ceil(total_records[0].count / page_size);

  if (sort) {
    DBQuery = DBQuery.orderBy(sort);
  } else {
    DBQuery = DBQuery.orderBy(OrderByColumn.CREATED_AT, SortOrder.DESCENDING);
  }

  const records: IFilterSubscriptionDetails[] = await DBQuery.clone().select([
    's.id',
    's.external_subscription_id',
    's.restaurant_id',
    's.plan_id',
    's.status',
    's.mode',
    's.authorization_status',
    's.authorization_amount',
    's.authorization_details', //contains authorization_link
    's.cancelled_by',
    's.cancellation_user_id',
    's.cancellation_details',
    's.partner',
    's.description',
    's.customer_name',
    's.customer_email',
    's.customer_phone',
    's.start_time',
    's.end_time',
    's.current_cycle',
    's.next_payment_on',
    's.additional_details',
    's.created_at',
    's.updated_at',
    'p.type as plan_type',
    'p.name as plan_name',
    'r.name as restaurant_name',
    'sr.subscription_remaining_orders',
    'sr.subscription_grace_period_remaining_orders',
    'sp.no_of_grace_period_orders_allotted',
    'sp.no_of_orders_bought',
    'sp.no_of_orders_consumed',
    DB.read.raw(`
    case when
    sr.subscription_id is not null
    and
    sr.subscription_end_time < CURRENT_TIMESTAMP
    and
    sr.subscription_grace_period_remaining_orders > 0
    and
    sr.subscription_end_time + interval '${await Globals.SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS.get()}' day > CURRENT_TIMESTAMP
    then true else false end
    as grace_period
    `),
  ]);
  logger.debug('filter subscriptions sql query', DBQuery.toSQL().toNative());

  return {
    total_records: total_records[0].count,
    total_pages,
    records,
  };
}

export async function readSubscriptionsInDuration(
  start_time: number,
  end_time: number
): Promise<{
  count: number;
  subscriptions: ISubscriptionAndRestaurantStats[];
}> {
  let DBQuery = DB.read.fromRaw(
    READ_SUBSCRIPTION_AND_RES_SUBSCRIPTION_SQL_QUERY
  );

  DBQuery = DBQuery.whereRaw(
    `end_time between to_timestamp(${start_time}) and to_timestamp(${end_time})`
  );
  const total_records = await DBQuery.clone().count('*');

  const records: ISubscriptionAndRestaurantStats[] =
    await DBQuery.clone().select('*');

  logger.debug('filter subscriptions sql query', DBQuery.toSQL().toNative());

  return {
    count: total_records[0].count,
    subscriptions: records,
  };
}

export async function readStaleSubscriptionsForUpdate(
  trx: Knex.Transaction
): Promise<IStaleSubscription[]> {
  return await DB.write
    .fromRaw(READ_STALE_SUBSCRIPTIONS_SQL_QUERY)
    .select('*')
    .forUpdate()
    .transacting(trx);
}

export async function readPaidSubscriptionsToPutOnHoldForUpdate(
  trx: Knex.Transaction
): Promise<IPaidSubscriptionsForOnHold[]> {
  return await DB.write
    .fromRaw(SUBSCRIPTION_WITH_CURRENT_AND_NEXT_PAYMENT)
    .select('*')
    .whereRaw(
      `
    plan_type != 'free'
    and
    status = 'active'
    and
    next_payment_on is not null
    and
    external_subscription_id is not null
    and
    next_payment_on < to_timestamp(
    ${moment()
      .add(
        await Globals.SUBSCRIPTION_END_TIME_GRACE_PERIOD_IN_DAYS.get(),
        'days'
      )
      .unix()}
  )
    `
    )
    .forUpdate()
    .transacting(trx);
}

export async function readRestaurantActiveSubscription(
  restaurant_id: string
): Promise<ISubscription> {
  return await DB.read
    .select('*')
    .from(SubscriptionTable.TableName)
    .where({
      restaurant_id: restaurant_id,
      status: SubscriptionStatus.ACTIVE,
    })
    .then((subscription: ISubscription[]) => {
      return subscription[0];
    })
    .catch((error: Error) => {
      logger.error(
        'ERROR RAISED WHILE READING RESTAURANT ACTIVE SUBSCRIPTION',
        error
      );
      throw error;
    });
}

export async function readRestaurantSubscriptionForUpdate(
  trx: Knex.Transaction,
  restaurant_id: string,
  status: SubscriptionStatus[]
): Promise<ISubscription> {
  return await DB.write
    .select('*')
    .from(SubscriptionTable.TableName)
    .where({
      restaurant_id: restaurant_id,
    })
    .whereIn('status', status)
    .forUpdate()
    .transacting(trx)
    .then((subscription: ISubscription[]) => {
      return subscription[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE READING SUBSCRIPTION FOR UPDATE', error);
      throw error;
    });
}

export async function readSubscriptionForUpdate(
  trx: Knex.Transaction,
  subscription_id: string
): Promise<ISubscription> {
  return await DB.write
    .select('*')
    .from(SubscriptionTable.TableName)
    .where({
      id: subscription_id,
    })
    .forUpdate()
    .transacting(trx)
    .then((subscription: ISubscription[]) => {
      return subscription[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE READING SUBSCRIPTION FOR UPDATE', error);
      throw error;
    });
}

export async function readSubscription(
  subscription_id: string
): Promise<ISubscription> {
  return await DB.read
    .select('*')
    .from(SubscriptionTable.TableName)
    .where({
      id: subscription_id,
    })
    .then((subscription: ISubscription[]) => {
      return subscription[0];
    })
    .catch((error: Error) => {
      logger.error('ERROR RAISED WHILE READING SUBSCRIPTION', error);
      throw error;
    });
}

export async function readSubscriptionPaymentByExternalPaymentId(
  subscription_id: string,
  external_payment_id: string
): Promise<ISubscriptionPayment> {
  return await DB.read
    .select('*')
    .from(SubscriptionPaymentTable.TableName)
    .where({
      subscription_id: subscription_id,
      external_payment_id: external_payment_id,
    })
    .then((subscription_payment: ISubscriptionPayment[]) => {
      return subscription_payment[0];
    })
    .catch((error: Error) => {
      logger.error(
        'ERROR RAISED WHILE READING SUBSCRIPTION PAYMENT BY EXTERNAL PAYMENT ID',
        error
      );
      throw error;
    });
}

export async function insertSubscriptionPayment(
  trx: Knex.Transaction,
  subscription_payment: ISubscriptionPayment
): Promise<ISubscriptionPayment> {
  return await DB.write(SubscriptionPaymentTable.TableName)
    .insert(subscription_payment)
    .returning('id')
    .transacting(trx)
    .then((subscription_payment: ISubscriptionPayment[]) => {
      logger.debug('subscription payment created', {
        subscription_payment_id: subscription_payment[0].id,
      });
      return subscription_payment[0];
    })
    .catch((error: Error) => {
      logger.error(
        'ERROR RAISED WHILE CREATING A SUBSCRIPTION PAYMENT RECORD',
        error
      );
      throw error;
    });
}

export async function updateSubscriptionPayment(
  trx: Knex.Transaction,
  subscription_payment_id: number,
  subscription_payment: ISubscriptionPayment
): Promise<ISubscriptionPayment> {
  return await DB.write(SubscriptionPaymentTable.TableName)
    .update(subscription_payment)
    .returning('*')
    .where('id', subscription_payment_id)
    .transacting(trx)
    .then((subscription_payment: ISubscriptionPayment[]) => {
      logger.debug('subscription payment updated', {
        subscription_payment_id: subscription_payment[0].id,
      });
      return subscription_payment[0];
    })
    .catch((error: Error) => {
      logger.error(
        'ERROR RAISED WHILE UPDATING A SUBSCRIPTION PAYMENT RECORD',
        error
      );
      throw error;
    });
}

export async function readSubscriptionPaymentByCycleNoForUpdate(
  trx: Knex.Transaction,
  subscription_id: string,
  cycle: number | null
): Promise<ISubscriptionPayment> {
  return await DB.write
    .select('*')
    .from(SubscriptionPaymentTable.TableName)
    .where({
      subscription_id: subscription_id,
      cycle: cycle,
    })
    .transacting(trx)
    .forUpdate()
    .then((subscription_payment: ISubscriptionPayment[]) => {
      return subscription_payment[0];
    })
    .catch((error: Error) => {
      logger.error(
        'ERROR RAISED WHILE READING SUBSCRIPTION PAYMENT BY CYCLE NO FOR UPDATE',
        error
      );
      throw error;
    });
}

export async function readSubscriptionPaymentByCycleNo(
  subscription_id: string,
  cycle: number
): Promise<ISubscriptionPayment> {
  return await DB.read
    .select('*')
    .from(SubscriptionPaymentTable.TableName)
    .where({
      subscription_id: subscription_id,
      cycle: cycle,
    })
    .then((subscription_payment: ISubscriptionPayment[]) => {
      return subscription_payment[0];
    })
    .catch((error: Error) => {
      logger.error(
        'ERROR RAISED WHILE READING SUBSCRIPTION PAYMENT BY CYCLE NO FOR UPDATE',
        error
      );
      throw error;
    });
}

export async function readSubscriptionPaymentByStatus(
  trx: Knex.Transaction,
  subscription_id: string,
  status: SubscriptionPaymentStatus[]
): Promise<ISubscriptionPayment> {
  return await DB.write
    .select('*')
    .from(SubscriptionPaymentTable.TableName)
    .where({
      subscription_id,
    })
    .whereIn('status', status)
    .transacting(trx)
    .forUpdate()
    .then((subscription_payment: ISubscriptionPayment[]) => {
      return subscription_payment[0];
    })
    .catch((error: Error) => {
      logger.error(
        'ERROR RAISED WHILE READING SUBSCRIPTION PAYMENT BY STATUS',
        error
      );
      throw error;
    });
}

export async function filterSubscriptionPayment(
  params: IFilterSubscriptionPaymentAsAdmin
): Promise<{
  total_records: number;
  total_pages: number;
  records: IFilterSubscriptionPaymentDetails[];
}> {
  const {search_text, filter, pagination, sort} = params;

  let DBQuery = DB.read.from(`${SubscriptionPaymentTable.TableName} as sp`);

  if (filter) {
    if (filter.status) {
      DBQuery = DBQuery.whereIn('sp.status', filter.status);
    }

    if (filter.restaurant_id) {
      DBQuery = DBQuery.where('s.restaurant_id', filter.restaurant_id);
    }

    if (filter.subscription_payment_id) {
      DBQuery = DBQuery.where('sp.id', filter.subscription_payment_id);
    }

    if (filter.subscription_id) {
      DBQuery = DBQuery.where('sp.subscription_id', filter.subscription_id);
    }

    if (filter.external_payment_id) {
      DBQuery = DBQuery.where(
        'sp.external_payment_id',
        filter.external_payment_id
      );
    }

    if (filter.no_of_grace_period_orders_allotted) {
      DBQuery = DBQuery.whereRaw(
        `sp.no_of_grace_period_orders_allotted <= ${filter.no_of_grace_period_orders_allotted}`
      );
    }

    if (filter.no_of_orders_bought) {
      DBQuery = DBQuery.whereRaw(
        `sp.no_of_orders_bought <= ${filter.no_of_orders_bought}`
      );
    }

    if (filter.no_of_orders_consumed) {
      DBQuery = DBQuery.whereRaw(
        `sp.no_of_orders_consumed <= ${filter.no_of_orders_consumed}`
      );
    }

    if (filter.cycle) {
      DBQuery = DBQuery.where('sp.cycle', filter.cycle);
    }

    if (filter.currency) {
      DBQuery = DBQuery.where('sp.currency', filter.currency);
    }

    if (filter.retry_attempts) {
      DBQuery = DBQuery.where('sp.retry_attempts', filter.retry_attempts);
    }

    if (filter.duration) {
      DBQuery = DBQuery.whereRaw(
        `sp.created_at between to_timestamp(${filter.duration.start_date}) and to_timestamp(${filter.duration.end_date})`
      );
    }
  }

  if (search_text) {
    const updated_search_text = search_text.toLowerCase().split("'").join("''");
    DBQuery = DBQuery.whereRaw(
      `LOWER(r.name) LIKE '%${updated_search_text}%' OR LOWER(p.name) LIKE '%${updated_search_text}%'`
    );
  }
  DBQuery = DBQuery.join(
    `${SubscriptionTable.TableName} as s`,
    'sp.subscription_id',
    's.id'
  )
    .join('restaurant as r', 's.restaurant_id', 'r.id')
    .join(`${PlanTable.TableName} as p`, 's.plan_id', 'p.id');

  const total_records = await DBQuery.clone().count('*');

  let page_size;
  let page_index;
  if (pagination) {
    page_size = pagination.page_size;
    page_index = pagination.page_index;
  } else {
    page_size = 10;
    page_index = 0;
  }
  const offset = page_index * page_size;
  DBQuery = DBQuery.offset(offset).limit(page_size);
  const total_pages = Math.ceil(total_records[0].count / page_size);

  if (sort) {
    DBQuery = DBQuery.orderBy(sort);
  } else {
    DBQuery = DBQuery.orderBy(OrderByColumn.CREATED_AT, SortOrder.DESCENDING);
  }

  const records: IFilterSubscriptionPaymentDetails[] =
    await DBQuery.clone().select([
      'sp.id',
      'sp.subscription_id',
      'sp.external_payment_id',
      'sp.status',
      'sp.no_of_grace_period_orders_allotted',
      'sp.no_of_orders_bought',
      'sp.no_of_orders_consumed',
      'sp.cycle',
      'sp.currency',
      'sp.amount',
      'sp.retry_attempts',
      'sp.failure_reason',
      'sp.transaction_time',
      'sp.scheduled_on',
      'sp.additional_details',
      'sp.created_at',
      'sp.updated_at',
      's.restaurant_id',
      'p.type as plan_type',
      'p.name as plan_name',
      'r.name as restaurant_name',
    ]);

  logger.debug(
    'filter subscription payments sql query',
    DBQuery.toSQL().toNative()
  );

  return {
    total_records: total_records[0].count,
    total_pages,
    records,
  };
}

export async function getNumberOfRestaurantSubscriptionsCreatedUnderParticularPlan(
  restaurant_id: string,
  plan_id: string
): Promise<number> {
  const result = await DB.read
    .from('subscription as s')
    .where('s.plan_id', plan_id)
    .where('s.restaurant_id', restaurant_id)
    .count('*');

  return result[0].count;
}

export async function readRestaurantsEligibleForAutoSubscribe(
  plan_id: string
): Promise<ISubscriptionAndRestaurantStats[]> {
  return await DB.read
    .from('restaurant as r')
    .join('subscription as s', 's.id', 'r.subscription_id')
    .join('plan as p', 'p.id', 's.plan_id')
    .where('p.id', plan_id)
    .where('p.type', PlanType.FREE)
    .where('s.end_time', '<', new Date())
    .select([
      'r.subscription_grace_period_remaining_orders',
      'r.subscription_remaining_orders',
    ])
    .select([
      's.id',
      's.external_subscription_id',
      's.restaurant_id',
      's.plan_id',
      's.status',
      's.mode',
      's.authorization_status',
      's.authorization_amount',
      's.authorization_details',
      's.cancelled_by',
      's.cancellation_user_id',
      's.cancellation_details',
      's.partner',
      's.customer_name',
      's.customer_email',
      's.customer_phone',
      's.start_time',
      's.end_time',
      's.current_cycle',
      's.next_payment_on',
    ]);
}
