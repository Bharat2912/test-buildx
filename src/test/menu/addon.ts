import request from 'supertest';
import {DB} from '../../data/knex';
import {vendor_token, admin_token, server} from '../utils/globals';
import {mockgetAdminDetails} from '../utils/mock_services';
import {menu_valid_restaurant_id} from './menu.test';

const addon_group_id = 4;
export default () => {
  describe('Testing Addon', () => {
    describe('Admin Apis', () => {
      describe('POST Addon', () => {
        test('Invalid Addon Group Id', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: 20,
              name: 'Chilli',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Group Not Found', code: 0},
          ]);
        });
        test('Empty Addon Name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: '   ',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Null Sequence', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Chilli',
              sequence: null,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"sequence" must be a number', code: 0},
          ]);
        });
        test('Adding Other Then Vegg Egg Non', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Chilli',
              sequence: 0,
              price: 12.5,
              veg_egg_non: 'vegan',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"veg_egg_non" must be one of [veg, egg, non-veg]',
              code: 0,
            },
          ]);
        });
        test('Successful Create Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Caramel-popcorns',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 3,
            name: 'Caramel-popcorns',
            addon_group_id: 4,
            addon_group_name: 'Popcorns',
            sequence: 91,
            price: 12.5,
            veg_egg_non: 'veg',
            in_stock: false,
            next_available_after: null,
            sgst_rate: 12.5,
            cgst_rate: 12.5,
            igst_rate: 12.5,
            gst_inclusive: true,
            external_id: 'ght-128978912bkj129',
            status: 'active',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
          });
          const read_main_category = await DB.read('addon');
          expect(read_main_category[2].id).toBe(3);
          expect(read_main_category[2].name).toBe('Caramel-popcorns');
          expect(read_main_category[2].is_deleted).toBe(false);
        });
        test('Failed Create Request >> duplicate name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Caramel-popcorns',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-1289789sd12bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Duplicate Addon Name',
              code: 0,
            },
          ]);
        });
      });
      describe('GET Addon', () => {
        test('Invalid Addon Group ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .get('/food/admin/menu/addon?addon_group_id=' + 20)
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Not Found', code: 0},
          ]);
        });
        test('Successful Get Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .get('/food/admin/menu/addon?addon_group_id=' + addon_group_id)
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          // pos_id and pos_partner keys are missing
          expect(response.body.result).toStrictEqual([
            {
              restaurant_id: menu_valid_restaurant_id,
              id: 3,
              addon_group_id: addon_group_id,
              name: 'Caramel-popcorns',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              in_stock: false,
              next_available_after: null,
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            },
          ]);
        });
      });
      describe('PUT Addon', () => {
        test('Invalid Addon Group Id', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/addon/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: 20,
              name: 'Chilli',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Group Not Found', code: 0},
          ]);
        });
        test('Empty Addon Name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/addon/1')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: '   ',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Null Sequence', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/addon/1')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Chilli',
              sequence: null,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"sequence" must be a number', code: 0},
          ]);
        });
        test('Adding Other Then Vegg Egg Non', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/addon/1')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Chilli',
              sequence: 0,
              price: 12.5,
              veg_egg_non: 'vegan',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"veg_egg_non" must be one of [veg, egg, non-veg]',
              code: 0,
            },
          ]);
        });
        test('Invalid Addon ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/addon/20')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Chillis',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Not Found', code: 0},
          ]);
        });
        test('Successful Update Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/admin/menu/addon/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Salted-popcorns',
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            addon_group_id: addon_group_id,
            addon_group_name: 'Popcorns',
            cgst_rate: 12.5,
            external_id: 'ght-128978912bkj129',
            gst_inclusive: true,
            id: 3,
            igst_rate: 12.5,
            in_stock: false,
            next_available_after: null,
            is_deleted: false,
            name: 'Salted-popcorns',
            price: 12.5,
            sequence: 91,
            sgst_rate: 12.5,
            status: 'active',
            veg_egg_non: 'veg',
            pos_id: null,
            pos_partner: null,
          });
          const read_main_category = await DB.read('addon');
          expect(read_main_category[2].id).toBe(3);
          expect(read_main_category[2].name).toBe('Salted-popcorns');
          expect(read_main_category[2].is_deleted).toBe(false);
        });
      });
      describe('POST Addon', () => {
        test('Successful Create Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Spicy-popcorns',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 4,
            name: 'Spicy-popcorns',
            addon_group_id: 4,
            addon_group_name: 'Popcorns',
            sequence: 91,
            price: 12.5,
            veg_egg_non: 'veg',
            in_stock: false,
            next_available_after: null,
            sgst_rate: 12.5,
            cgst_rate: 12.5,
            igst_rate: 12.5,
            gst_inclusive: true,
            external_id: 'ght-128978912bkj129',
            status: 'active',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
          });
        });
      });
      describe('POST Addon In Stock', () => {
        test('Invalid Addon ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon/20/in_stock')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              in_stock: true,
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Not Found', code: 0},
          ]);
        });
        test('Successful In Sotck Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/addon/4/in_stock')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              in_stock: true,
            });
          expect(response.statusCode).toBe(200);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 4,
            name: 'Spicy-popcorns',
            addon_group_id: 4,
            restaurant_id: menu_valid_restaurant_id,
            pos_partner: null,
          });
        });
      });
      describe('DELETE Addon', () => {
        test('Invalid Addon ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/addon/20')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Not Found', code: 0},
          ]);
        });
        test('Successful Delete Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/addon/4')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 4,
            name: 'Spicy-popcorns',
            addon_group_id: 4,
            restaurant_id: menu_valid_restaurant_id,
            pos_partner: null,
          });
          const read_main_category = await DB.read('addon');
          expect(read_main_category[3].id).toBe(4);
          expect(read_main_category[3].name).toBe('Spicy-popcorns');
          expect(read_main_category[3].is_deleted).toBe(true);
        });
        test('Failed Delete Request >> Not found', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/addon/1')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(404);
        });
      });
    });

    describe('Vendor Apis', () => {
      describe('POST Addon', () => {
        test('Invalid Addon Group Id', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/addon')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: 20,
              name: 'Chilli',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Group Not Found', code: 0},
          ]);
        });
        test('Empty Addon Name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/addon')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: '   ',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Null Sequence', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/addon')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Chilli',
              sequence: null,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"sequence" must be a number', code: 0},
          ]);
        });
        test('Adding Other Then Vegg Egg Non', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/vendor/menu/addon')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Chilli',
              sequence: 0,
              price: 12.5,
              veg_egg_non: 'vegan',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"veg_egg_non" must be one of [veg, egg, non-veg]',
              code: 0,
            },
          ]);
        });
        test('Successful Create Request', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/addon')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Sweet-popcorns',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 5,
            name: 'Sweet-popcorns',
            addon_group_id: 4,
            addon_group_name: 'Popcorns',
            sequence: 91,
            price: 12.5,
            veg_egg_non: 'veg',
            in_stock: false,
            next_available_after: null,
            sgst_rate: 12.5,
            cgst_rate: 12.5,
            igst_rate: 12.5,
            gst_inclusive: true,
            external_id: 'ght-128978912bkj129',
            status: 'active',
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
          });
          const read_main_category = await DB.read('addon');
          expect(read_main_category[4].id).toBe(5);
          expect(read_main_category[4].name).toBe('Sweet-popcorns');
          expect(read_main_category[4].is_deleted).toBe(false);
        });
        test('Failed Create Request >> duplicate name', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/addon')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Sweet-popcorns',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Duplicate Addon Name',
              code: 0,
            },
          ]);
        });
      });
      describe('GET Addon', () => {
        test('Invalid Addon Group ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .get('/food/vendor/menu/addon?addon_group_id=' + 20)
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Not Found', code: 0},
          ]);
        });
        test('Successful Get Request', async () => {
          const response = await request(server)
            .get('/food/vendor/menu/addon?addon_group_id=' + addon_group_id)
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual([
            {
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              id: 3,
              addon_group_id: 4,
              name: 'Salted-popcorns',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              in_stock: false,
              next_available_after: null,
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            },
            {
              restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
              id: 5,
              addon_group_id: 4,
              name: 'Sweet-popcorns',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              in_stock: false,
              next_available_after: null,
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            },
          ]);
        });
      });
      describe('PUT Addon', () => {
        test('Invalid Addon Group Id', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/vendor/menu/addon/3')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: 20,
              name: 'Chilli',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Group Not Found', code: 0},
          ]);
        });
        test('Empty Addon Name', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/vendor/menu/addon/3')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: '   ',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Null Sequence', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/vendor/menu/addon/3')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Chilli',
              sequence: null,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"sequence" must be a number', code: 0},
          ]);
        });
        test('Adding Other Then Vegg Egg Non', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .put('/food/vendor/menu/addon/3')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'Chilli',
              sequence: 0,
              price: 12.5,
              veg_egg_non: 'vegan',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"veg_egg_non" must be one of [veg, egg, non-veg]',
              code: 0,
            },
          ]);
        });
        test('Successful Update Request', async () => {
          const response = await request(server)
            .put('/food/vendor/menu/addon/5')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'savory-popcorns',
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            addon_group_id: 4,
            addon_group_name: 'Popcorns',
            cgst_rate: 12.5,
            external_id: 'ght-128978912bkj129',
            gst_inclusive: true,
            id: 5,
            igst_rate: 12.5,
            in_stock: false,
            next_available_after: null,
            is_deleted: false,
            name: 'savory-popcorns',
            price: 12.5,
            sequence: 91,
            sgst_rate: 12.5,
            status: 'active',
            veg_egg_non: 'veg',
            pos_id: null,
            pos_partner: null,
          });
          const read_main_category = await DB.read('addon');
          expect(read_main_category[4].id).toBe(5);
          expect(read_main_category[4].name).toBe('savory-popcorns');
          expect(read_main_category[4].is_deleted).toBe(false);
        });
      });
      describe('POST Addon', () => {
        test('Successful Create Request', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/addon')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              addon_group_id: addon_group_id,
              name: 'achari-popcorns',
              sequence: 91,
              price: 12.5,
              veg_egg_non: 'veg',
              sgst_rate: 12.5,
              cgst_rate: 12.5,
              igst_rate: 12.5,
              gst_inclusive: true,
              external_id: 'ght-128978912bkj129',
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            addon_group_id: 4,
            addon_group_name: 'Popcorns',
            cgst_rate: 12.5,
            external_id: 'ght-128978912bkj129',
            gst_inclusive: true,
            id: 6,
            igst_rate: 12.5,
            in_stock: false,
            next_available_after: null,
            is_deleted: false,
            name: 'achari-popcorns',
            price: 12.5,
            sequence: 91,
            sgst_rate: 12.5,
            status: 'active',
            veg_egg_non: 'veg',
            pos_id: null,
            pos_partner: null,
          });
          const read_main_category = await DB.read('addon');
          expect(read_main_category[5].id).toBe(6);
          expect(read_main_category[5].name).toBe('achari-popcorns');
          expect(read_main_category[5].is_deleted).toBe(false);
        });
      });
      describe('POST Addon In Stock', () => {
        test('Invalid Addon ID', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/addon/20/in_stock')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              in_stock: true,
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Not Found', code: 0},
          ]);
        });
        test('Successful In Stock Request', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/addon/3/in_stock')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              in_stock: true,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 3,
            name: 'Salted-popcorns',
            addon_group_id: 4,
            restaurant_id: menu_valid_restaurant_id,
            pos_partner: null,
          });
        });
      });
      describe('DELETE Addon', () => {
        test('Invalid Addon ID', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/vendor/menu/addon/20')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Addon Not Found', code: 0},
          ]);
        });
        test('Successful Delete Request', async () => {
          const response = await request(server)
            .delete('/food/vendor/menu/addon/3')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            id: 3,
            name: 'Salted-popcorns',
            addon_group_id: 4,
            restaurant_id: menu_valid_restaurant_id,
            pos_partner: null,
          });
          const read_addon = await DB.read('addon');
          expect(read_addon[5].id).toBe(3);
          expect(read_addon[5].name).toBe('Salted-popcorns');
          expect(read_addon[5].is_deleted).toBe(true);
        });
        test('Failed Delete Request >> Not found', async () => {
          const response = await request(server)
            .delete('/food/vendor/menu/addon/3')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(404);
        });
      });
    });
  });
};
