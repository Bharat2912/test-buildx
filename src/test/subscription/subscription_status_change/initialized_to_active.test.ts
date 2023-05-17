import {initGlobalServices} from '../../utils/init';
import {loadMockSeedData, testCasesClosingTasks} from '../../utils/utils';
import {DB} from '../../../data/knex';
import {
  PlanCategory,
  PlanIntervalType,
  PlanType,
  SubscriptionAuthStatus,
  SubscriptionPartner,
  SubscriptionPaymentStatus,
  SubscriptionStatus,
} from '../../../module/food/subscription/enum';
import {createTestPlan, createTestSubscription} from '../utlis';
import moment from 'moment';
import {processSubscriptionStatusChange} from '../../../module/food/subscription/worker_services/subscription_status_change';
import {mockSendEmail} from '../../utils/mock_services';
import {IRestaurant_Basic} from '../../../module/food/restaurant/models';
import {ISubscriptionPayment} from '../../../internal/subscription';

const restaurant_id = 'b0909e52-a731-4665-a791-ee6479008805';
beforeAll(async () => {
  await initGlobalServices();

  await loadMockSeedData('restaurant');
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('CREATE FREE SUBSCRIPTION AS ADMIN', () => {
  test('CREATE SUBSCRIPTION', async () => {
    const plan = await createTestPlan({
      id: 'RES_e6372ad4-0a69-4dc1-a936-26393cd4b100',
      name: 'Paid Plan',
      type: PlanType.PERIODIC,
      category: PlanCategory.BASIC,
      no_of_orders: 3,
      no_of_grace_period_orders: 2,
      amount: 100,
      interval_type: PlanIntervalType.DAY,
      intervals: 1,
      max_cycles: 100,
      description: 'description',
      active: true,
      terms_and_conditions: 'terms_and_conditions',
      image: {},
      created_at: new Date(),
      updated_at: new Date(),
    });

    const subscription = await createTestSubscription({
      id: 'RES_5959e9f7-565d-475a-822b-80a8fd4f0c3a',
      external_subscription_id: '99602',
      restaurant_id: restaurant_id,
      plan_id: plan.id,
      status: SubscriptionStatus.INITIALIZED,
      mode: 'NPC',
      authorization_status: SubscriptionAuthStatus.PENDING,
      authorization_amount: 10,
      authorization_details: {
        authorization_link: 'https://cfre.in/mi3uhev',
      },
      partner: SubscriptionPartner.CASHFREE,
      description: 'subscription description',
      customer_name: 'Amogh Chavan',
      customer_email: 'amogh.c@speedyy.com',
      customer_phone: '9819997648',
      end_time: moment().add(1, 'year').toDate(),
      current_cycle: 0,
      next_payment_on: moment().add(1, 'minute').toDate(),
      additional_details: {
        return_url: 'https://vendor.dev.speedyy.com/login',
      },
      created_at: new Date(),
      updated_at: new Date(),
    });
    const mock_send_email = mockSendEmail();
    await processSubscriptionStatusChange({
      subscription: {
        id: subscription.id!,
        external_subscription_id: subscription.external_subscription_id!,
        plan_id: plan.id,
        customer_name: subscription.customer_name!,
        customer_email: subscription.customer_email!,
        customer_phone: subscription.customer_phone!,
        mode: subscription.mode!,
        authorization_link: 'https://cfre.in/mi3uhev',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: 'active' as any,
        first_charge_date: moment().add(2, 'days').toDate(),
        current_cycle: 0,
        next_payment_on: moment().add(2, 'days').toDate(),
        bank_account_number: 'bank_account_number',
        bank_account_holder: 'bank_account_holder',
        umrn: 'umrn',
        created_at: new Date(),
      },
    });
    expect(mock_send_email).toBeCalledTimes(1);

    //check if restaurant benefits are updated or not
    const restaurant: IRestaurant_Basic = (
      await DB.read.from('restaurant').where({id: restaurant_id})
    )[0];

    expect(moment(restaurant.subscription_end_time).unix()).not.toBeGreaterThan(
      moment().add(3, 'days').unix()
    );
    expect(restaurant.subscription_remaining_orders).toBe(3);
    expect(restaurant.subscription_grace_period_remaining_orders).toBe(2);
    expect(restaurant.subscription_id).toBe(subscription.id);

    //check if subscription payment record is created or not
    const subscription_payment: ISubscriptionPayment = (
      await DB.read.from('subscription_payment').where({
        subscription_id: subscription.id,
        id: 1,
      })
    )[0];
    expect(subscription_payment).not.toBeNull();
    expect(subscription_payment.status).toBe(SubscriptionPaymentStatus.PENDING);
  });
});
