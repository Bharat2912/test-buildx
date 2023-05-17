import request from 'supertest';
import {DB} from '../../data/knex';
import {vendor_token, admin_token, server} from '../utils/globals';
import {mockgetAdminDetails} from '../utils/mock_services';
import {
  menu_valid_restaurant_id,
  menu_invalid_restaurant_id,
} from './menu.test';

export default () => {
  describe('Testing Main Category Groups', () => {
    describe('Admin Apis', () => {
      describe('POST Main Category', () => {
        test('Request Wtih Invalid Restaurnat ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/main_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant_id: menu_invalid_restaurant_id,
              name: 'Soft-Drinks',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Restaurant Not Found', code: 1093},
          ]);
        });
        test('Request Wtih Empty name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/main_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant_id: menu_valid_restaurant_id,
              name: ' ',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Successful Create Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/main_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant_id: menu_valid_restaurant_id,
              name: 'Soft-Drinks',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 1,
            name: 'Soft-Drinks',
            restaurant_id: menu_valid_restaurant_id,
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 1,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_main_category = await DB.read('main_category');
          expect(read_main_category[0].id).toBe(1);
          expect(read_main_category[0].name).toBe('Soft-Drinks');
          expect(read_main_category[0].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_main_category[0].is_deleted).toBe(false);
        });
        test('Failed Create Request >> duplicate name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/main_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant_id: menu_valid_restaurant_id,
              name: 'Soft-Drinks',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Duplicate Main Category Name',
              code: 0,
            },
          ]);
        });
      });
      describe('GET Main Category', () => {
        test('GET | Send Invalid Restaurnat ID | When Not Found Return Empty', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .get(
              `/food/admin/menu/main_category?restaurant_id=${menu_invalid_restaurant_id}`
            )
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual([]);
        });
        test('Successful Get Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .get(
              `/food/admin/menu/main_category?restaurant_id=${menu_valid_restaurant_id}`
            )
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual([
            {
              discount_rate: 0,
              id: 1,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Soft-Drinks',
              sequence: 1,
            },
          ]);
          const read_main_category = await DB.read('main_category');
          expect(read_main_category[0].id).toBe(1);
          expect(read_main_category[0].name).toBe('Soft-Drinks');
          expect(read_main_category[0].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_main_category[0].is_deleted).toBe(false);
        });
      });
      describe('PUT Main Category', () => {
        test('PUT | Send Invalid main_category_id', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/main_category/20')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              name: 'Beverages',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Main Category Not Found', code: 0},
          ]);
        });
        test('Successful Update Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/main_category/1')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              name: 'Beverages',
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 1,
            name: 'Beverages',
            restaurant_id: menu_valid_restaurant_id,
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 1,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_main_category = await DB.read('main_category');
          expect(read_main_category[0].id).toBe(1);
          expect(read_main_category[0].name).toBe('Beverages');
          expect(read_main_category[0].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_main_category[0].is_deleted).toBe(false);
        });
      });
      describe('POST Main Category', () => {
        test('Successful Create Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/main_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              name: 'Soft-Drinks',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 2,
            name: 'Soft-Drinks',
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 2,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_main_category = await DB.read('main_category');
          expect(read_main_category[1].id).toBe(2);
          expect(read_main_category[1].name).toBe('Soft-Drinks');
          expect(read_main_category[1].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_main_category[1].is_deleted).toBe(false);
        });
      });
      describe('POST Holiday Slot', () => {
        test('Invalid Main Category', async () => {
          mockgetAdminDetails();
          const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
          const response = await request(server)
            .post('/food/admin/menu/main_category/20/createHolidaySlot')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Main-Category Not Found', code: 0},
          ]);
        });
        test('Invalid Epoch Time To Add / Remove HolidaySlot Remove Request', async () => {
          const epoch = Math.floor(new Date().getTime() / 1000) - 86400;
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/main_category/1/createHolidaySlot')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'End time is before current date', code: 0},
          ]);
        });
        test('Successful HolidaySlot Request', async () => {
          mockgetAdminDetails();
          const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
          const response = await request(server)
            .post('/food/admin/menu/main_category/1/createHolidaySlot')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 1,
          });
          //const read_main_category = await DB.read('menu_item');
          // expect(read_main_category[0].id).toBe(1);
          // expect(read_main_category[0].name).toBe('Beverages');
          // expect(read_main_category[0].restaurant_id).toBe(
          //   menu_valid_restaurant_id
          // );
          // expect(read_main_category[0].is_deleted).toBe(false);
        });
        test('Successfully HolidaySlot Remove Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/main_category/1/createHolidaySlot')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              end_epoch: null,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 1,
          });
        });
      });
      describe('DELETE Main Category', () => {
        test('Invalid Restaurnat ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/main_category/20')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Main-Category  Not Found', code: 0},
          ]);
        });
        test('Successful Delete Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/main_category/1')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 1,
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            name: 'Beverages',
            pos_partner: null,
          });
          const read_main_category = await DB.read('main_category');
          expect(read_main_category[1].is_deleted).toBe(true);
        });
        test('Failed Delete Request >> Not found', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/main_category/1')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(404);
        });
      });
      describe('Cannot Delete Main Category It Containes Sub Category | First Delete Sub Category Then We Can Delete Main Category', () => {
        test('Successful Main Category Create Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/main_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant_id: menu_valid_restaurant_id,
              name: 'Test-Delete',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
        });
        test('Successful Sub Category Create Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/sub_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              main_category_id: 3,
              name: 'Chilli',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
        });
        test('Main Category Containes One Sub Category | Need to throw error', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/main_category/3')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              code: 1093,
              message: 'Main Category Containes 1 Sub Categories',
              data: {
                sub_category: [
                  {
                    id: 1,
                    name: 'Chilli',
                    main_category_id: 3,
                  },
                ],
              },
            },
          ]);
        });
        test('Successful Delete Request For Sub Category', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/sub_category/1')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 1,
          });
        });
        test('Successful Delete Request For Main Category', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/main_category/3')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 3,
            name: 'Test-Delete',
            pos_partner: null,
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
          });
        });
      });
    });

    describe('Vendor Apis', () => {
      describe('POST Main Category', () => {
        test('Request Wtih Invalid Token', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/main_category')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              name: 'Soft-Drinks',
            });
          expect(response.statusCode).toBe(403);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'forbidden', code: 0},
          ]);
        });
        test('Request Wtih Empty name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/main_category')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: ' ',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Successful Create Request', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/main_category')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: 'Topping',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 4,
            name: 'Topping',
            restaurant_id: menu_valid_restaurant_id,
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 3,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_main_category = await DB.read('main_category');
          expect(read_main_category[3].id).toBe(4);
          expect(read_main_category[3].name).toBe('Topping');
          expect(read_main_category[3].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_main_category[3].is_deleted).toBe(false);
        });
        test('Failed Create Request >> duplicate name', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/main_category')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: 'Topping',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Duplicate Main Category Name',
              code: 0,
            },
          ]);
        });
      });
      describe('GET Main Category', () => {
        test('Successful Get Request', async () => {
          const response = await request(server)
            .get('/food/vendor/menu/main_category')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual([
            {
              discount_rate: 0,
              id: 2,
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              name: 'Soft-Drinks',
              sequence: 2,
            },
            {
              discount_rate: 0,
              id: 4,
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              name: 'Topping',
              sequence: 3,
            },
          ]);
        });
      });
      describe('PUT Main Category', () => {
        test('PUT | Send Invalid main_category_id', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/vendor/menu/main_category/20')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: 'Beverages',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Main Category Not Found', code: 0},
          ]);
        });
        test('PUT | Send Empty main_category name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/vendor/menu/main_category/3')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: ' ',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Successful Update Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/vendor/menu/main_category/4')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: 'Beverages',
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 4,
            name: 'Beverages',
            restaurant_id: menu_valid_restaurant_id,
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 3,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_main_category = await DB.read('main_category');
          expect(read_main_category[3].id).toBe(4);
          expect(read_main_category[3].name).toBe('Beverages');
          expect(read_main_category[3].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_main_category[3].is_deleted).toBe(false);
        });
      });
      describe('POST Main Category', () => {
        test('Successful Create Request', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/main_category')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: 'Topping',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 5,
            name: 'Topping',
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 4,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_main_category = await DB.read('main_category');
          expect(read_main_category[4].id).toBe(5);
          expect(read_main_category[4].name).toBe('Topping');
          expect(read_main_category[4].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_main_category[4].is_deleted).toBe(false);
        });
      });
      describe('POST Holiday Slot', () => {
        test('Invalid Main Category', async () => {
          mockgetAdminDetails();
          const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
          const response = await request(server)
            .post('/food/vendor/menu/main_category/20/createHolidaySlot')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Main-Category Not Found', code: 0},
          ]);
        });
        test('Invalid Epoch Time To Add / Remove HolidaySlot Remove Request', async () => {
          const epoch = Math.floor(new Date().getTime() / 1000) - 86400;
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/main_category/4/createHolidaySlot')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'End time is before current date', code: 0},
          ]);
        });
        test('Successful HolidaySlot Request', async () => {
          const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
          const response = await request(server)
            .post('/food/vendor/menu/main_category/4/createHolidaySlot')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 4,
          });
        });
        test('Successfully HolidaySlot Remove Request', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/main_category/4/createHolidaySlot')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              end_epoch: null,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 4,
          });
        });
      });
      describe('DELETE Main Category', () => {
        test('Invalid Main Category', async () => {
          const response = await request(server)
            .delete('/food/vendor/menu/main_category/20')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Main-Category Not Found', code: 0},
          ]);
        });
        test('Successful Delete Request', async () => {
          const response = await request(server)
            .delete('/food/vendor/menu/main_category/4')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 4,
            restaurant_id: menu_valid_restaurant_id,
            name: 'Beverages',
            pos_partner: null,
          });
          const read_main_category = await DB.read('main_category');
          expect(read_main_category[4].name).toBe('Beverages');
          expect(read_main_category[4].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_main_category[4].is_deleted).toBe(true);
        });
        test('Failed Delete Request >> Not found', async () => {
          const response = await request(server)
            .delete('/food/vendor/menu/main_category/3')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(404);
        });
      });
      describe('Cannot Delete Main Category It Containes Sub Category | First Delete Sub Category Then We Can Delete Main Category', () => {
        test('Successful Main Category Create Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/main_category')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: 'Test-Delete',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
        });
        test('Successful Sub Category Create Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/sub_category')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              main_category_id: 6,
              name: 'Chilli',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
        });
        test('Main Category Containes One Sub Category | Need to throw error', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/vendor/menu/main_category/6')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              code: 1093,
              message: 'Main Category Containes 1 Sub Categories',
              data: {
                sub_category: [{id: 2, name: 'Chilli', main_category_id: 6}],
              },
            },
          ]);
        });
        test('Successful Delete Request For Sub Category', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/vendor/menu/sub_category/2')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 2,
          });
        });
        test('Successful Delete Request For Main Category', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/vendor/menu/main_category/6')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 6,
            name: 'Test-Delete',
            pos_partner: null,
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
          });
        });
      });
    });
  });
};
