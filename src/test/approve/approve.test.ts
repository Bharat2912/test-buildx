/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import {createTestServer} from '../utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../utils/utils';
import {
  ApprovalEntityType,
  ApprovalStatus,
} from '../../module/food/approval/enums';
import {
  mockgetAdminDetails,
  mockgetAdminDetailsByIds,
} from '../utils/mock_services';

jest.mock('axios');

let server: Application;
let vendor_token: string;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  vendor_token = signToken({
    id: 'cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4',
    user_type: 'vendor',
    data: {
      type: 'restaurant',
      outlet_id: 'b0909e52-a731-4665-a791-ee6479008805',
      force_reset_password: false,
    },
  });
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});

afterAll(async () => {
  await testCasesClosingTasks();
});

describe('Approve Test Cases', () => {
  test('Approval record should create after vendor creates new addon group', async () => {
    //create new addon group which internally creates a approval record in approval table
    const addon_group = await request(server)
      .post('/food/vendor/menu/addon_group')
      .set('Authorization', `Bearer ${vendor_token}`)
      .send({
        restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
        name: 'Soft-Drinks',
      });
    expect(addon_group.statusCode).toBe(201);
    expect(addon_group.body.status).toBe(true);
    const {created_at, updated_at, ...rest} = addon_group.body.result;
    expect(rest).toStrictEqual({
      id: 1,
      name: 'Soft-Drinks',
      is_deleted: false,
      restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
      pos_id: null,
      pos_partner: null,
    });

    mockgetAdminDetails();
    //filter approval table as admin to get exact approval records
    const approval_details = await request(server)
      .post('/food/admin/approval/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        filter: {
          entity_type: [ApprovalEntityType.ADDON_GROUP],
          restaurant_id: ['b0909e52-a731-4665-a791-ee6479008805'],
          change_requested_by: ['cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4'],
        },
      });
    expect(approval_details.statusCode).toBe(200);
    expect(approval_details.body.status).toBe(true);
    delete approval_details.body.result.records[0].created_at;
    delete approval_details.body.result.records[0].updated_at;
    expect(approval_details.body.result.records[0]).toStrictEqual({
      id: 1,
      action: 'create',
      restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
      restaurant_name: 'Burger King',
      entity_type: 'addon_group',
      entity_id: 1,
      previous_entity_details: null,
      requested_entity_changes: {
        id: 1,
        name: 'Soft-Drinks',
        created_at: created_at,
        is_deleted: false,
        updated_at: updated_at,
        restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
        pos_id: null,
        pos_partner: null,
      },
      status: 'pending',
      status_comments: null,
      change_requested_by: 'cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4',
      approved_by: null,
      additional_details: null,
    });
  });

  test('Review approval as admin', async () => {
    mockgetAdminDetails();
    const review_response = await request(server)
      .post('/food/admin/approval/review/1')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        status: ApprovalStatus.REJECTED,
        status_comments: 'changes are not valid',
      });
    expect(review_response.statusCode).toBe(200);
    expect(review_response.body.status).toBe(true);
    expect(review_response.body.result.total_records_affected).toBe(1);
    delete review_response.body.result.records[0].created_at;
    delete review_response.body.result.records[0].updated_at;
    delete review_response.body.result.records[0].requested_entity_changes
      .created_at;
    delete review_response.body.result.records[0].requested_entity_changes
      .updated_at;
    expect(review_response.body.result).toStrictEqual({
      total_records_affected: 1,
      records: [
        {
          id: 1,
          action: 'create',
          restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
          entity_type: 'addon_group',
          entity_id: 1,
          previous_entity_details: null,
          requested_entity_changes: {
            id: 1,
            name: 'Soft-Drinks',
            is_deleted: false,
            restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
            pos_id: null,
            pos_partner: null,
          },
          status: 'rejected',
          status_comments: 'changes are not valid',
          change_requested_by: 'cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4',
          approved_by: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
          additional_details: null,
        },
      ],
    });

    //also check database approval table if following details are updated or not
    mockgetAdminDetails();
    mockgetAdminDetailsByIds();
    const approval_details = await request(server)
      .post('/food/admin/approval/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        search_text: '1',
        filter: {
          status: [ApprovalStatus.REJECTED],
          entity_type: [ApprovalEntityType.ADDON_GROUP],
          restaurant_id: ['b0909e52-a731-4665-a791-ee6479008805'],
          change_requested_by: ['cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4'],
        },
      });
    expect(approval_details.statusCode).toBe(200);
    expect(approval_details.body.status).toBe(true);
    delete approval_details.body.result.records[0].created_at;
    delete approval_details.body.result.records[0].updated_at;
    delete approval_details.body.result.records[0].requested_entity_changes
      .created_at;
    delete approval_details.body.result.records[0].requested_entity_changes
      .updated_at;
    expect(approval_details.body.result.records[0]).toStrictEqual({
      id: 1,
      action: 'create',
      restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
      restaurant_name: 'Burger King',
      entity_type: 'addon_group',
      entity_id: 1,
      previous_entity_details: null,
      requested_entity_changes: {
        id: 1,
        name: 'Soft-Drinks',
        is_deleted: false,
        restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
        pos_id: null,
        pos_partner: null,
      },
      status: 'rejected',
      status_comments: 'changes are not valid',
      change_requested_by: 'cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4',
      approved_by: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
      approved_by_name: 'TestAdmin',
      additional_details: null,
    });

    //incorrect id added
    const approval_details_filter = await request(server)
      .post('/food/admin/approval/filter')
      .set('Authorization', `Bearer ${admin_token}`)
      .send({
        search_text: "1's",
        filter: {
          status: [ApprovalStatus.REJECTED],
          entity_type: [ApprovalEntityType.ADDON_GROUP],
          restaurant_id: ['b0909e52-a731-4665-a791-ee6479008805'],
          change_requested_by: ['cdf39e49-3b6b-4558-b08d-cb00b8ddb0a4'],
        },
      });
    expect(approval_details_filter.statusCode).toBe(200);
    expect(approval_details_filter.body.status).toBe(true);
  });
});
