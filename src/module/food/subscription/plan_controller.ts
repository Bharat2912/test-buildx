import {Request, Response} from 'express';
import handleErrors from '../../../utilities/controllers/handle_errors';
import {
  sendError,
  sendSuccess,
} from '../../../utilities/controllers/handle_response';
import {
  create_plan_details,
  plan_filter_admin_options,
  plan_filter_vendor_options,
  update_plan_details,
} from './validation';
import {ICreatePlan, IFilterPlan, IUpdatePlan} from './types';
import {filterPlans, insertPlan, readPlanForUpdate, updatePlan} from './model';
import {getTransaction} from '../../../data/knex';
import ResponseError from '../../../utilities/response_error';
import {v4 as uuidv4} from 'uuid';
import {ServiceTag} from '../../../enum';
import {createPlan} from '../../../internal/subscription';
import {PlanType} from './enum';

export async function createPlanAsAdmin(req: Request, res: Response) {
  try {
    const validation = create_plan_details.validate(req.body);
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    const validated_req = validation.value as ICreatePlan;
    if (validated_req.no_of_grace_period_orders > validated_req.no_of_orders) {
      return sendError(res, 400, [
        {
          message:
            'number of grace period orders should always be less than plan orders',
          code: 2013,
        },
      ]);
    }

    validated_req.id = ServiceTag.FOOD_SERVICE_TAG + '_' + uuidv4();

    if (validated_req.type !== PlanType.FREE) {
      const external_plan_response = await createPlan({
        id: validated_req.id,
        name: validated_req.name,
        type: validated_req.type,
        max_cycles: validated_req.max_cycles,
        amount: validated_req.amount,
        interval_type: validated_req.interval_type,
        intervals: 1,
        description: validated_req.description,
      });

      if (!external_plan_response.created) {
        return sendError(res, 400, [
          {
            message:
              'Something went worng at external subscription service. Please try again later',
            code: 2012,
          },
        ]);
      }
    } else {
      validated_req.amount = 0;
    }

    const plan_id = await insertPlan(validated_req);
    return sendSuccess(res, 200, {plan_id});
  } catch (error) {
    return handleErrors(res, error, 'FAILED WHILE CREATING NEW PLAN');
  }
}

export async function updatePlanAsAdmin(req: Request, res: Response) {
  try {
    const validation = update_plan_details.validate({
      id: req.params.plan_id,
      ...req.body,
    });
    if (validation.error) {
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 100,
        },
      ]);
    }
    const validated_req = validation.value as IUpdatePlan;
    const trx = await getTransaction();
    try {
      const plan = await readPlanForUpdate(trx, validated_req.id);
      if (!plan) {
        throw new ResponseError(400, [
          {
            message: 'Invalid plan id',
            code: 2002,
          },
        ]);
      }
      const updated_plan = await updatePlan(trx, validated_req);
      await trx.commit();
      return sendSuccess(res, 200, {
        plan: updated_plan,
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    return handleErrors(res, error, 'FAILED BY UPDATING PLAN DETAILS');
  }
}

export async function filterPlansAsAdmin(req: Request, res: Response) {
  try {
    const validation = plan_filter_admin_options.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as IFilterPlan;
    const result = await filterPlans(validated_req);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleErrors(res, error, 'FAILED WHILE FILTERING PLANS AS ADMIN');
  }
}

export async function filterPlansAsVendor(req: Request, res: Response) {
  try {
    const validation = plan_filter_vendor_options.validate(req.body);
    if (validation.error)
      return sendError(res, 400, [
        {
          message: validation.error.details[0].message,
          code: 1000,
        },
      ]);
    const validated_req = validation.value as IFilterPlan;
    if (validated_req.filter) {
      validated_req.filter.active = true;
    } else {
      validated_req.filter = {
        active: true,
      };
    }
    const reuslt = await filterPlans(validated_req);
    return sendSuccess(res, 200, reuslt);
  } catch (error) {
    return handleErrors(res, error, 'FAILED WHILE FILTERING PLANS AS VENDOR');
  }
}
