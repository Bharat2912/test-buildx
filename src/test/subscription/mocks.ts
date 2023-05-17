import moment from 'moment';
import * as subscription_internal_apis from '../../../src/internal/subscription';
import {SubscriptionStatus} from '../../module/food/subscription/enum';

export function mockCreatePlanAtExternalService() {
  const mock_function = jest.spyOn(subscription_internal_apis, 'createPlan');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        created: true,
      });
    })
  );
  return mock_function;
}

export function mockCreateSubscriptionAtExternalService(plan_id: string) {
  const mock_function = jest.spyOn(
    subscription_internal_apis,
    'createSubscription'
  );
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        subscription: {
          id: 'RES_a8372ad4-0a69-4dc1-a936-26393cd4b200',
          external_subscription_id: '213313',
          plan_id: plan_id,
          customer_name: 'customer_name',
          customer_email: 'customer_email',
          customer_phone: 'customer_phone',
          mode: 'mode',
          authorization_link: 'authorization_link',
          status: SubscriptionStatus.INITIALIZED,
          first_charge_date: moment().add(2, 'days').toDate(),
          current_cycle: 0,
          next_payment_on: moment().add(2, 'days').toDate(),
          bank_account_number: 'bank_account_number',
          bank_account_holder: 'bank_account_holder',
          umrn: 'umrn',
          created_at: new Date(),
        },
      });
    })
  );
  return mock_function;
}

export function mockCancelSubscriptionAtExternalService(plan_id: string) {
  const mock_function = jest.spyOn(
    subscription_internal_apis,
    'cancelSubscription'
  );
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        subscription: {
          id: 'RES_a8372ad4-0a69-4dc1-a936-26393cd4b200',
          external_subscription_id: '213313',
          plan_id: plan_id,
          customer_name: 'customer_name',
          customer_email: 'customer_email',
          customer_phone: 'customer_phone',
          mode: 'mode',
          authorization_link: 'authorization_link',
          status: SubscriptionStatus.CANCELLED,
          first_charge_date: moment().add(2, 'days').toDate(),
          current_cycle: 0,
          next_payment_on: moment().add(2, 'days').toDate(),
          bank_account_number: 'bank_account_number',
          bank_account_holder: 'bank_account_holder',
          umrn: 'umrn',
          created_at: new Date(),
        },
      });
    })
  );
  return mock_function;
}
