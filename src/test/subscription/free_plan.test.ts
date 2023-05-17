import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {signToken, testCasesClosingTasks} from '../utils/utils';
import {
  PlanCategory,
  PlanIntervalType,
  PlanType,
} from '../../module/food/subscription/enum';
import {IFilterPlan} from '../../module/food/subscription/types';
import {mockgetAdminDetails} from '../utils/mock_services';
jest.mock('axios');
let server: Application;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();

  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

test('CREATE FREE PLAN AS ADMIN', async () => {
  const mock_get_admin_details = mockgetAdminDetails();

  //create new plan with post api
  const create_plan_response = await request(server)
    .post('/food/admin/subscription/plan')
    .set('Authorization', `Bearer ${admin_token}`)
    .send({
      name: 'Free Plan',
      type: PlanType.FREE,
      category: PlanCategory.BASIC,
      interval_type: PlanIntervalType.DAY,
      description: 'description of plan',
      no_of_orders: 10,
      no_of_grace_period_orders: 10,
      terms_and_conditions: 'terms_and_conditions',
    });
  expect(create_plan_response.body.statusCode).toBe(200);
  expect(create_plan_response.body.status).toBe(true);
  expect(create_plan_response.body.result).toHaveProperty('plan_id');
  expect(mock_get_admin_details).toHaveBeenCalledTimes(1);
  //get new plan
  const get_plan_response = await request(server)
    .post('/food/admin/subscription/plan/filter')
    .set('Authorization', `Bearer ${admin_token}`)
    .send({
      filter: {
        plan_id: create_plan_response.body.result.plan_id,
      },
    } as IFilterPlan);
  expect(get_plan_response.body.statusCode).toBe(200);
  expect(get_plan_response.body.status).toBe(true);
  expect(get_plan_response.body.result.records).not.toBeNull();
  expect(get_plan_response.body.result.records[0].id).toBe(
    create_plan_response.body.result.plan_id
  );
  expect(get_plan_response.body.result.records[0].active).toBe(true);
  expect(mock_get_admin_details).toHaveBeenCalledTimes(2);

  /*==== INVALID PLAN NAME AS search_text ====*/
  const filter_plan_fail_response = await request(server)
    .post('/food/admin/subscription/plan/filter')
    .set('Authorization', `Bearer ${admin_token}`)
    .send({
      search_text: "Speedyy's plan",
      filter: {},
    } as IFilterPlan);
  expect(filter_plan_fail_response.body.statusCode).toBe(200);
  expect(filter_plan_fail_response.body.status).toBe(true);
  expect(filter_plan_fail_response.body.result.total_records).toEqual(0);
  expect(mock_get_admin_details).toHaveBeenCalledTimes(3);

  /*=== VALID PLAN NAME AS search_text ====*/
  const filter_plan_success_response = await request(server)
    .post('/food/admin/subscription/plan/filter')
    .set('Authorization', `Bearer ${admin_token}`)
    .send({
      search_text: 'Free',
      filter: {},
    } as IFilterPlan);
  expect(filter_plan_success_response.body.statusCode).toBe(200);
  expect(filter_plan_success_response.body.status).toBe(true);
  expect(filter_plan_success_response.body.result.total_records).toEqual(1);
  expect(mock_get_admin_details).toHaveBeenCalledTimes(4);
});
