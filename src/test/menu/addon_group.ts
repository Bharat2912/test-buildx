import request from 'supertest';
import {DB} from '../../data/knex';
import {vendor_token, admin_token, server} from '../utils/globals';
import {mockgetAdminDetails} from '../utils/mock_services';
import {
  menu_invalid_restaurant_id,
  menu_valid_restaurant_id,
} from './menu.test';

export default () => {
  describe('Testing Addon Groups', () => {
    describe('Admin Apis', () => {
      describe('POST Addon Groups', () => {
        test('Request Wtih Invalid Restaurnat ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon_group')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant_id: menu_invalid_restaurant_id,
              name: 'Sauces',
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
            .post('/food/admin/menu/addon_group')
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
            .post('/food/admin/menu/addon_group')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant_id: menu_valid_restaurant_id,
              name: 'Sauces',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 3,
            name: 'Sauces',
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
          });
          const read_addon_group = await DB.read('addon_group');
          expect(read_addon_group[2].id).toBe(3);
          expect(read_addon_group[2].name).toBe('Sauces');
          expect(read_addon_group[2].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_addon_group[2].is_deleted).toBe(false);
        });
        test('Failed Create Request >> duplicate name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon_group')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant_id: menu_valid_restaurant_id,
              name: 'Sauces',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Duplicate Addon Group Name',
              code: 0,
            },
          ]);
        });
      });
      describe('GET Addon Groups', () => {
        test('GET | Send Invalid Restaurnat ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .get(
              `/food/admin/menu/addon_group?restaurant_id=${menu_invalid_restaurant_id}`
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
              `/food/admin/menu/addon_group?restaurant_id=${menu_valid_restaurant_id}`
            )
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toMatchObject([
            {
              id: 1,
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              name: 'Soft-Drinks',
              in_stock: false,
            },
            {
              id: 2,
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              name: 'Delete-Addon-Group',
              in_stock: false,
            },
            {
              id: 3,
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              name: 'Sauces',
              in_stock: false,
            },
          ]);
        });
      });
      describe('PUT Addon Groups', () => {
        test('PUT | Send Invalid Addon Group ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/addon_group/10')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              name: 'Beverages',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Group Not Found', code: 0},
          ]);
        });
        test('PUT | With Empty Name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/addon_group/1')
            .set('Authorization', `Bearer ${admin_token}`)
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
            .put('/food/admin/menu/addon_group/1')
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
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
          });
          const read_addon_group = await DB.read('addon_group');
          expect(read_addon_group[2].id).toBe(1);
          expect(read_addon_group[2].name).toBe('Beverages');
          expect(read_addon_group[2].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_addon_group[2].is_deleted).toBe(false);
        });
      });
      describe('POST Addon Groups', () => {
        test('Successful Create Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon_group')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              name: 'Popcorns',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 4,
            name: 'Popcorns',
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
          });
          const read_addon_group = await DB.read('addon_group');
          expect(read_addon_group[3].id).toBe(4);
          expect(read_addon_group[3].name).toBe('Popcorns');
          expect(read_addon_group[3].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_addon_group[3].is_deleted).toBe(false);
        });
      });
      describe('POST Addon Groups In Stock', () => {
        test('Invalid In Stock Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon_group/4/in_stock')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              in_stock: 123,
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"in_stock" must be a boolean', code: 0},
          ]);
        });
        test('Successful In Stock Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon_group/4/in_stock')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              in_stock: true,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 4,
            name: 'Popcorns',
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            pos_partner: null,
          });
        });
      });
      describe('DELETE Addon Groups', () => {
        test('Invalid Addon Group ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/addon_group/20')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Group Not Found', code: 0},
          ]);
        });
        test('Successful Delete Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/addon_group/3')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.result).toStrictEqual({
            id: 3,
            restaurant_id: menu_valid_restaurant_id,
            name: 'Sauces',
            pos_partner: null,
          });
          const read_addon_group = await DB.read('addon_group');
          expect(read_addon_group[3].name).toBe('Sauces');
          expect(read_addon_group[3].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_addon_group[3].is_deleted).toBe(true);
        });
        test('Failed Delete Request >> Not found', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/addon_group/3')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(404);
        });
      });
      describe('Cannot Delete Addon Group | First Need To Delete/Remove Addon From Addon Group', () => {
        test('Valid Delete Addon Group Request | Need to throw error', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/addon_group/2')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              code: 1093,
              message: 'Addon Group Containes 1 Addons',
              data: {addons: [{addon_id: 2, addon_name: 'Chilli'}]},
            },
          ]);
        });
        test('Successfuly Deleted Addon', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/addon/2')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 2,
            name: 'Chilli',
            pos_partner: null,
            addon_group_id: 2,
            restaurant_id: menu_valid_restaurant_id,
          });
        });
        test('Valid Delete Addon Group Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/addon_group/2')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result.id).toBe(2);
        });
      });
    });

    describe('Vendor Apis', () => {
      describe('POST Addon Groups', () => {
        test('Request Wtih Empty name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/addon_group')
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
            .post('/food/vendor/menu/addon_group')
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
            restaurant_id: menu_valid_restaurant_id,
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
          });
          const read_addon_group = await DB.read('addon_group');
          expect(read_addon_group[4].id).toBe(5);
          expect(read_addon_group[4].name).toBe('Topping');
          expect(read_addon_group[4].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_addon_group[4].is_deleted).toBe(false);
        });
        test('Failed Create Request >> duplicate name', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/addon_group')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: 'Topping',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Duplicate Addon Group Name',
              code: 0,
            },
          ]);
        });
      });
      describe('GET Addon Groups', () => {
        test('Successful Get Request', async () => {
          const response = await request(server)
            .get('/food/vendor/menu/addon_group')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toMatchObject([
            {
              id: 1,
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              name: 'Beverages',
              in_stock: false,
            },
            {
              id: 4,
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              name: 'Popcorns',
              in_stock: false,
            },
            {
              id: 5,
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              name: 'Topping',
              in_stock: false,
            },
          ]);
        });
      });
      describe('PUT Addon Groups', () => {
        test('PUT | Send Invalid Addon Group ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/vendor/menu/addon_group/10')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: 'Beverages',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Group Not Found', code: 0},
          ]);
        });
        test('PUT | With Empty Name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/vendor/menu/addon_group/1')
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
          const response = await request(server)
            .put('/food/vendor/menu/addon_group/5')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: 'Top-Ing',
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 5,
            name: 'Top-Ing',
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
          });
          const read_addon_group = await DB.read('addon_group');
          expect(read_addon_group[4].id).toBe(5);
          expect(read_addon_group[4].name).toBe('Top-Ing');
          expect(read_addon_group[4].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_addon_group[4].is_deleted).toBe(false);
        });
      });
      describe('POST Addon Groups', () => {
        test('Successful Create Request', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/addon_group')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              name: 'Toppings',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 6,
            name: 'Toppings',
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
          });
          const read_addon_group = await DB.read('addon_group');
          expect(read_addon_group[5].id).toBe(6);
          expect(read_addon_group[5].name).toBe('Toppings');
          expect(read_addon_group[5].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_addon_group[5].is_deleted).toBe(false);
        });
      });
      describe('POST Addon Groups In Stock', () => {
        test('Invalid In Stock Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/addon_group/1/in_stock')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              in_stock: 123,
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"in_stock" must be a boolean', code: 0},
          ]);
        });
        test('Successful In Stock Request', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/addon_group/6/in_stock')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              in_stock: true,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 6,
            name: 'Toppings',
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            pos_partner: null,
          });
        });
      });
      describe('DELETE Addon Groups', () => {
        test('Invalid Addon Group ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/vendor/menu/addon_group/20')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Group Not Found', code: 0},
          ]);
        });
        test('Valid Delete Request | Addon Group Containes 1 Addon |Need to throw error', async () => {
          const response = await request(server)
            .delete('/food/vendor/menu/addon_group/1')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              code: 1093,
              message: 'Addon Group Containes 1 Addons',
              data: {addons: [{addon_id: 1, addon_name: 'Chilli'}]},
            },
          ]);
        });
        test('Valid Addon Delete Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/addon/1')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 1,
            name: 'Chilli',
            pos_partner: null,
            addon_group_id: 1,
            restaurant_id: menu_valid_restaurant_id,
          });
        });
        test('Successful Delete Request', async () => {
          const response = await request(server)
            .delete('/food/vendor/menu/addon_group/1')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.result).toStrictEqual({
            id: 1,
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            name: 'Beverages',
            pos_partner: null,
          });
          const read_addon_group = await DB.read('addon_group');
          expect(read_addon_group[5].id).toBe(1);
          expect(read_addon_group[5].name).toBe('Beverages');
          expect(read_addon_group[5].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_addon_group[5].is_deleted).toBe(true);
        });
        test('Failed Delete Request >> Not found', async () => {
          const response = await request(server)
            .delete('/food/vendor/menu/addon_group/3')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(404);
        });
      });
    });
  });
};
