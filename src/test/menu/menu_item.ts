import request from 'supertest';
import {DB} from '../../data/knex';
import {mockGenerateDownloadFileURL} from '../mocks/s3_mocks';
import {vendor_token, admin_token, server} from '../utils/globals';
import {
  mockdeleteMenuItemSQS,
  mockgetAdminDetails,
  mockputMenuItemSQS,
} from '../utils/mock_services';
import {
  menu_invalid_restaurant_id,
  menu_valid_restaurant_id,
} from './menu.test';

const sub_category_id = 5;
const addon_group_id = 4;
const addon_id = 5;
export default () => {
  describe('Testing Menu Item', () => {
    describe('Admin Apis', () => {
      describe('POST | Menu Items', () => {
        test('Invalid Sub Category ID', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: 20,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Sub Category Not Found', code: 0},
          ]);
        });
        test('Invalid Restaurnat ID', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_invalid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Restaurnat Not Found', code: 0},
          ]);
        });
        test('Empty Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: ' ',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Adding Other Then veg_egg_non ', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'vegan',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
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
        test('Empty Variant Group', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"variant_groups" must contain at least 1 items',
              code: 0,
            },
          ]);
        });
        test('Empty Variant Group Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: ' ',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"variant_groups[0].name" is not allowed to be empty',
              code: 0,
            },
          ]);
        });
        test('Variant Groups Empty Variant', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message:
                '"variant_groups[0].variants" must contain at least 1 items',
              code: 0,
            },
          ]);
        });
        test('Variant Groups Variant Empty Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: ' ',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message:
                '"variant_groups[0].variants[0].name" is not allowed to be empty',
              code: 0,
            },
          ]);
        });
        test('Variant Groups Variant Sending Other Then Veg_Egg_Non', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'vegan',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message:
                '"variant_groups[0].variants[0].veg_egg_non" must be one of [veg, egg, non-veg]',
              code: 0,
            },
          ]);
        });
        test('Empty Addon Group', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"addon_groups" must contain at least 1 items',
              code: 0,
            },
          ]);
        });
        test('Invalid Addon Group Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: 89,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Addon Group Not Found',
              code: 0,
            },
          ]);
        });
        test('Empty Addons Of Addon Group Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"addon_groups[0].addons" must contain at least 1 items',
              code: 0,
            },
          ]);
        });
        test('Invalid Addons ID Of Addon Group Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: 200,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Addons Not Found',
              code: 0,
            },
          ]);
        });
        test('Successful Create Request', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          mockGenerateDownloadFileURL();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Cheesy-Pizza',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              description: null,
              is_spicy: true,
              image: null,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'crust',
                  variants: [
                    {
                      name: 'Double-crust',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: 1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            discount_rate: 0,
            menu_item_id: 3,
            restaurant_id: menu_valid_restaurant_id,
            menu_item_name: 'Cheesy-Pizza',
            sub_category_id: 5,
            description: null,
            price: 12.5,
            veg_egg_non: 'veg',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            packing_charges: 12.5,
            is_spicy: true,
            serves_how_many: 2,
            service_charges: 12.5,
            item_sgst_utgst: 12.5,
            item_cgst: 12.5,
            item_igst: 12.5,
            item_inclusive: true,
            image: {
              url: 'url',
            },
            disable: false,
            external_id: 'ght-128978912bkj129',
            allow_long_distance: true,
            next_available_after: null,
            is_deleted: false,
            sub_category_name: 'Sweet',
            pos_id: null,
            pos_partner: null,
            sequence: 0,
            variant_groups: [
              {
                id: 3,
                variant_group_name: 'crust',
                sequence: 1,
                variants: [
                  {
                    id: 3,
                    variant_group_id: 3,
                    variant_name: 'Double-crust',
                    is_default: true,
                    price: 12.5,
                    veg_egg_non: 'veg',
                    in_stock: true,
                    serves_how_many: 1,
                    sequence: 1,
                  },
                ],
              },
            ],
            addon_groups: [
              {
                id: 4,
                addon_group_name: 'Popcorns',
                min_limit: 1,
                max_limit: 5,
                free_limit: -1,
                sequence: 90,
                addons: [
                  {
                    id: 5,
                    addon_name: 'savory-popcorns',
                    sequence: 91,
                    price: 12.5,
                    veg_egg_non: 'veg',
                    in_stock: false,
                    sgst_rate: 12.5,
                    cgst_rate: 12.5,
                    igst_rate: 12.5,
                    gst_inclusive: true,
                    external_id: 'ght-128978912bkj129',
                  },
                ],
              },
            ],
            menu_item_slots: null,
          });

          const read_menu_item = await DB.read('menu_item').where({id: 3});
          expect(read_menu_item[0].id).toBe(3);
          expect(read_menu_item[0].name).toBe('Cheesy-Pizza');
          expect(read_menu_item[0].sub_category_id).toBe(sub_category_id);
          expect(read_menu_item[0].restaurant_id).toBe(
            menu_valid_restaurant_id
          );

          const read_variant_group = (
            await DB.read('item_variant_group').where({menu_item_id: 3})
          )[0];
          expect(read_variant_group.id).toBe(3);
          expect(read_variant_group.menu_item_id).toBe(3);
          expect(read_variant_group.name).toBe('crust');
          expect(read_variant_group.is_deleted).toBe(false);

          const read_variant = (
            await DB.read('item_variant').where({
              id: 3,
            })
          )[0];
          expect(read_variant.id).toBe(3);
          expect(read_variant.variant_group_id).toBe(3);
          expect(read_variant.name).toBe('Double-crust');
          expect(read_variant.is_deleted).toBe(false);

          const read_addon = (
            await DB.read('item_addon').where({
              menu_item_id: 3,
            })
          )[0];
          expect(read_addon.menu_item_id).toBe(3);
          expect(read_addon.addon_id).toBe(5);

          const read_addon_group = (
            await DB.read('item_addon_group').where({
              menu_item_id: 3,
            })
          )[0];
          expect(read_addon_group.menu_item_id).toBe(3);
          expect(read_addon_group.addon_group_id).toBe(4);
        });
        test('Delete Addon Fail', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .delete('/food/admin/menu/addon/5')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(400);
          expect(response.body).toMatchObject({
            status: true,
            statusCode: 400,
            message: 'Successful Response',
            result: {
              error: true,
              error_menu_items: [
                {
                  menu_item_id: 3,
                  menu_item_name: 'Cheesy-Pizza',
                  error_addon_groups: [
                    {
                      addon_group_id: 4,
                      addon_group_name: 'Popcorns',
                      addon_count: 1,
                      min_limit: 1,
                      delete_count: 1,
                      existing_addons: [
                        {
                          addon_id: 5,
                          addon_name: 'savory-popcorns',
                        },
                      ],
                      deleting_addons: [
                        {
                          addon_id: 5,
                          addon_name: 'savory-popcorns',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          });
        });
        test('Failed Create Request >> duplicate name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Cheesy-Pizza',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'crust',
                  variants: [
                    {
                      name: 'Double-crust',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Duplicate Item Name',
              code: 0,
            },
          ]);
        });
        test('Set discount as admin', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/discount/' + menu_valid_restaurant_id)
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              main_categories: [
                {
                  main_category_id: 2,
                  discount_rate: 2.5,
                },
                {
                  main_category_id: 5,
                  discount_rate: 3,
                },
              ],
            });
          expect(response.body.result.main_category[0].discount_rate).toBe(2.5);
          expect(response.body.result.main_category[1].discount_rate).toBe(3);
        });

        test('Set discount as admin', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/discount/' + menu_valid_restaurant_id)
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_categories: [
                {
                  sub_category_id: 5,
                  discount_rate: 2.5,
                },
                {
                  sub_category_id: 8,
                  discount_rate: 3,
                },
              ],
            });
          console.log(JSON.stringify(response.body.result, null, 4));
          expect(response.body.result.main_category[0].discount_rate).toBe(0);
          expect(response.body.result.main_category[1].discount_rate).toBe(0);
          expect(
            response.body.result.main_category[0].sub_category[0].discount_rate
          ).toBe(2.5);
          expect(
            response.body.result.main_category[0].sub_category[1].discount_rate
          ).toBe(3);
        });

        test('Set discount as admin', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/discount/' + menu_valid_restaurant_id)
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              menu_items: [
                {
                  menu_item_id: 3,
                  discount_rate: 2.5,
                },
              ],
            });
          expect(
            response.body.result.main_category[0].sub_category[0].discount_rate
          ).toBe(0);
          expect(
            response.body.result.main_category[0].sub_category[1].discount_rate
          ).toBe(0);
          expect(
            response.body.result.main_category[0].sub_category[0].menu_item[0]
              .discount_rate
          ).toBe(2.5);
        });

        test('Set discount as admin', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/discount/' + menu_valid_restaurant_id)
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant: {
                restaurant_id: menu_valid_restaurant_id,
                discount_rate: 1,
              },
            });
          expect(response.body.result.main_category[0].discount_rate).toBe(0);
          expect(response.body.result.main_category[1].discount_rate).toBe(0);
          expect(
            response.body.result.main_category[0].sub_category[0].discount_rate
          ).toBe(0);
          expect(
            response.body.result.main_category[0].sub_category[1].discount_rate
          ).toBe(0);
          expect(
            response.body.result.main_category[0].sub_category[0].menu_item[0]
              .discount_rate
          ).toBe(0);
        });

        test('Set discount as admin', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/discount/' + menu_valid_restaurant_id)
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              restaurant: {
                restaurant_id: menu_valid_restaurant_id,
                discount_rate: 0,
              },
            });
          expect(response.body.result.main_category[0].discount_rate).toBe(0);
          expect(response.body.result.main_category[1].discount_rate).toBe(0);
          expect(
            response.body.result.main_category[0].sub_category[0].discount_rate
          ).toBe(0);
          expect(
            response.body.result.main_category[0].sub_category[1].discount_rate
          ).toBe(0);
          expect(
            response.body.result.main_category[0].sub_category[0].menu_item[0]
              .discount_rate
          ).toBe(0);
        });
      });
      describe('GET | Menu Items', () => {
        test('Successful Get Request', async () => {
          mockgetAdminDetails();
          mockGenerateDownloadFileURL();
          const response = await request(server)
            .get('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            discount_rate: 0,
            menu_item_id: 3,
            restaurant_id: menu_valid_restaurant_id,
            menu_item_name: 'Cheesy-Pizza',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            sub_category_id: 5,
            sub_category_name: 'Sweet',
            description: null,
            price: 12.5,
            veg_egg_non: 'veg',
            packing_charges: 12.5,
            is_spicy: true,
            serves_how_many: 2,
            service_charges: 12.5,
            item_sgst_utgst: 12.5,
            item_cgst: 12.5,
            item_igst: 12.5,
            item_inclusive: true,
            image: {url: 'url'},
            disable: false,
            external_id: 'ght-128978912bkj129',
            allow_long_distance: true,
            next_available_after: null,
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 0,
            variant_groups: [
              {
                id: 3,
                variant_group_name: 'crust',
                sequence: 1,
                variants: [
                  {
                    id: 3,
                    variant_group_id: 3,
                    variant_name: 'Double-crust',
                    is_default: true,
                    price: 12.5,
                    veg_egg_non: 'veg',
                    in_stock: true,
                    serves_how_many: 1,
                    sequence: 1,
                  },
                ],
              },
            ],
            addon_groups: [
              {
                id: 4,
                addon_group_name: 'Popcorns',
                min_limit: 1,
                max_limit: 5,
                free_limit: -1,
                sequence: 90,
                addons: [
                  {
                    id: 5,
                    addon_name: 'savory-popcorns',
                    sequence: 91,
                    price: 12.5,
                    veg_egg_non: 'veg',
                    in_stock: false,
                    sgst_rate: 12.5,
                    cgst_rate: 12.5,
                    igst_rate: 12.5,
                    gst_inclusive: true,
                    external_id: 'ght-128978912bkj129',
                  },
                ],
              },
            ],
            menu_item_slots: null,
          });
        });
      });
      describe('PUT | Menu Items', () => {
        test('Invalid Menu Item ID', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/20')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: 20,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Menu Item not found', code: 0},
          ]);
        });
        test('Invalid Sub Category ID', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: 20,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Sub Category Not Found', code: 0},
          ]);
        });
        test('Invalid Restaurnat ID', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_invalid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'can not change menu items origin restaurant', code: 0},
          ]);
        });
        test('Empty Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: ' ',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Adding Other Then veg_egg_non ', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'vegan',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
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
        test('Empty Addon Group', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"addon_groups" must contain at least 1 items',
              code: 0,
            },
          ]);
        });
        test('Empty Variant Group', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"variant_groups" must contain at least 1 items',
              code: 0,
            },
          ]);
        });
        test('Empty Variant Group Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: ' ',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"variant_groups[0].name" is not allowed to be empty',
              code: 0,
            },
          ]);
        });
        test('Invalid Variant Group Id', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  id: 40003,
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Invalid variant group Ids 40003',
              code: 0,
            },
          ]);
        });
        test('Variant Groups Empty Variant', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message:
                '"variant_groups[0].variants" must contain at least 1 items',
              code: 0,
            },
          ]);
        });
        test('Variant Groups Variant Empty Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: ' ',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message:
                '"variant_groups[0].variants[0].name" is not allowed to be empty',
              code: 0,
            },
          ]);
        });
        test('Variant Groups Variant Invalid Id', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  id: 3,
                  name: 'South Indian',
                  variants: [
                    {
                      id: 8000,
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Invalid variant Ids 8000',
              code: 0,
            },
          ]);
        });
        test('Variant Groups Variant Sending Other Then Veg_Egg_Non', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'vegan',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message:
                '"variant_groups[0].variants[0].veg_egg_non" must be one of [veg, egg, non-veg]',
              code: 0,
            },
          ]);
        });
        test('Invalid Addon Group Id', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: 89,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Invalid addon group Ids 89',
              code: 0,
            },
          ]);
        });
        test('Empty Addons Of Addon Group Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"addon_groups[0].addons" must contain at least 1 items',
              code: 0,
            },
          ]);
        });
        test('Invalid Addons ID Of Addon Group Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: 200,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Invalid addon Ids 200',
              code: 0,
            },
          ]);
        });
        test('Successful Update Request', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          mockGenerateDownloadFileURL();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'salty-chilly-popcorn',
              image: null,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            discount_rate: 0,
            menu_item_id: 3,
            restaurant_id: menu_valid_restaurant_id,
            menu_item_name: 'salty-chilly-popcorn',
            sub_category_id: 5,
            description: null,
            price: 12.5,
            veg_egg_non: 'veg',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            packing_charges: 12.5,
            is_spicy: true,
            serves_how_many: 2,
            service_charges: 12.5,
            item_sgst_utgst: 12.5,
            item_cgst: 12.5,
            item_igst: 12.5,
            item_inclusive: true,
            image: {
              url: 'url',
            },
            disable: false,
            external_id: 'ght-128978912bkj129',
            allow_long_distance: true,
            next_available_after: null,
            is_deleted: false,
            variant_groups: null,
            sub_category_name: 'Sweet',
            addon_groups: [],
            menu_item_slots: null,
            pos_id: null,
            pos_partner: null,
            sequence: 0,
          });
          const read_menu_item = await DB.read('menu_item');
          expect(read_menu_item[2].id).toBe(3);
          expect(read_menu_item[2].name).toBe('salty-chilly-popcorn');
          expect(read_menu_item[2].sub_category_id).toBe(sub_category_id);
          expect(read_menu_item[2].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
        });
        test('Successful Update Request', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          mockGenerateDownloadFileURL();
          const response = await request(server)
            .put('/food/admin/menu/menu_item/3')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'salty-chilly-popcorn',
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            discount_rate: 0,
            menu_item_id: 3,
            restaurant_id: menu_valid_restaurant_id,
            menu_item_name: 'salty-chilly-popcorn',
            sub_category_id: 5,
            description: null,
            price: 12.5,
            veg_egg_non: 'veg',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            packing_charges: 12.5,
            is_spicy: true,
            serves_how_many: 2,
            service_charges: 12.5,
            item_sgst_utgst: 12.5,
            item_cgst: 12.5,
            item_igst: 12.5,
            item_inclusive: true,
            image: {
              url: 'url',
            },
            disable: false,
            external_id: 'ght-128978912bkj129',
            allow_long_distance: true,
            next_available_after: null,
            is_deleted: false,
            variant_groups: null,
            sub_category_name: 'Sweet',
            addon_groups: [],
            menu_item_slots: null,
            pos_id: null,
            pos_partner: null,
            sequence: 0,
          });
          const read_menu_item = await DB.read('menu_item');
          expect(read_menu_item[2].id).toBe(3);
          expect(read_menu_item[2].name).toBe('salty-chilly-popcorn');
          expect(read_menu_item[2].sub_category_id).toBe(sub_category_id);
          expect(read_menu_item[2].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
        });
      });
      describe('POST | Menu Items', () => {
        test('Successful Create Request', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          mockGenerateDownloadFileURL();
          const response = await request(server)
            .post('/food/admin/menu/menu_item')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            discount_rate: 0,
            menu_item_id: 4,
            restaurant_id: menu_valid_restaurant_id,
            menu_item_name: 'Chilli',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            sub_category_id: 5,
            sub_category_name: 'Sweet',
            description: null,
            price: 12.5,
            veg_egg_non: 'veg',
            packing_charges: 12.5,
            is_spicy: true,
            serves_how_many: 2,
            service_charges: 12.5,
            item_sgst_utgst: 12.5,
            item_cgst: 12.5,
            item_igst: 12.5,
            item_inclusive: true,
            image: {url: 'url'},
            disable: false,
            external_id: 'ght-128978912bkj129',
            allow_long_distance: true,
            next_available_after: null,
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 0,
            variant_groups: [
              {
                id: 4,
                variant_group_name: 'South Indian',
                sequence: 1,
                variants: [
                  {
                    id: 4,
                    variant_group_id: 4,
                    variant_name: 'Thali',
                    is_default: true,
                    price: 12.5,
                    veg_egg_non: 'veg',
                    in_stock: true,
                    serves_how_many: 1,
                    sequence: 1,
                  },
                ],
              },
            ],
            addon_groups: [
              {
                id: 4,
                addon_group_name: 'Popcorns',
                min_limit: -1,
                max_limit: 5,
                free_limit: -1,
                sequence: 90,
                addons: [
                  {
                    id: 5,
                    addon_name: 'savory-popcorns',
                    sequence: 91,
                    price: 12.5,
                    veg_egg_non: 'veg',
                    in_stock: false,
                    sgst_rate: 12.5,
                    cgst_rate: 12.5,
                    igst_rate: 12.5,
                    gst_inclusive: true,
                    external_id: 'ght-128978912bkj129',
                  },
                ],
              },
            ],
            menu_item_slots: null,
          });

          const read_menu_item = await DB.read('menu_item');
          expect(read_menu_item[3].id).toBe(4);
          expect(read_menu_item[3].name).toBe('Chilli');
          expect(read_menu_item[3].sub_category_id).toBe(sub_category_id);
          expect(read_menu_item[3].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
        });
      });
      // describe('PUT | Menu Item', () => {
      //   test('Successful Update Request', async () => {
      //     mockgetAdminDetails();
      //     mockputMenuItemSQS();
      //     mockGenerateDownloadFileURL();
      //     const response = await request(server)
      //       .put('/food/admin/menu/menu_item/4')
      //       .set('Authorization', `Bearer ${admin_token}`)
      //       .send({
      //         sub_category_id: sub_category_id,
      //         restaurant_id: menu_valid_restaurant_id,
      //         addon_groups: [],
      //         variant_groups: [],
      //       });
      //     expect(response.statusCode).toBe(200);
      //     expect(response.body.status).toBe(true);
      //     delete response.body.result.created_at;
      //     delete response.body.result.updated_at;
      //     expect(response.body.result).toStrictEqual({
      //       menu_item_id: 4,
      //       restaurant_id: menu_valid_restaurant_id,
      //       menu_item_name: 'Chilli',
      //       main_category_id: 2,
      //       main_category_name: 'Soft-Drinks',
      //       sub_category_id: 5,
      //       sub_category_name: 'Sweet',
      //       description: null,
      //       price: 12.5,
      //       veg_egg_non: 'veg',
      //       packing_charges: 12.5,
      //       is_spicy: true,
      //       serves_how_many: 2,
      //       service_charges: 12.5,
      //       item_sgst_utgst: 12.5,
      //       item_cgst: 12.5,
      //       item_igst: 12.5,
      //       item_inclusive: true,
      //       image: {url: 'url'},
      //       disable: false,
      //       external_id: 'ght-128978912bkj129',
      //       allow_long_distance: true,
      //       next_available_after: null,
      //       is_deleted: false,
      //       pos_partner: null,
      //       pos_id: null,
      //       sequence: 0,
      //       variant_groups: null,
      //       addon_groups: [],
      //       menu_item_slots: null,
      //     });
      //     const read_menu_item = await DB.read('menu_item');
      //     expect(read_menu_item[3].id).toBe(4);
      //     expect(read_menu_item[3].name).toBe('Chilli');
      //     expect(read_menu_item[3].sub_category_id).toBe(sub_category_id);
      //     expect(read_menu_item[3].restaurant_id).toBe(
      //       menu_valid_restaurant_id
      //     );
      //     const read_variant_group = (
      //       await DB.read('item_variant_group').where({menu_item_id: 4})
      //     )[0];
      //     expect(read_variant_group.id).toBe(4);
      //     expect(read_variant_group.menu_item_id).toBe(4);
      //     expect(read_variant_group.name).toBe('South Indian');
      //     expect(read_variant_group.is_deleted).toBe(true);

      //     const read_variant = (
      //       await DB.read('item_variant').where({
      //         variant_group_id: 4,
      //       })
      //     )[0];
      //     expect(read_variant.id).toBe(4);
      //     expect(read_variant.name).toBe('Thali');
      //     expect(read_variant.is_deleted).toBe(true);

      //     const read_addon = await DB.read('item_addon').where({
      //       menu_item_id: 4,
      //     });
      //     console.log(read_addon);

      //     const read_addon_group = await DB.read('item_addon_group').where({
      //       menu_item_id: 4,
      //     });
      //     console.log(read_addon_group);
      //   });
      // });
      describe('POST | Menu Item Holiday Slot', () => {
        test('Invalid Menu Item ID', async () => {
          mockgetAdminDetails();
          const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
          const response = await request(server)
            .post('/food/admin/menu/menu_item/20/createHolidaySlot')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Menu Item not found', code: 0},
          ]);
        });
        test('Invalid Epoch Time', async () => {
          mockgetAdminDetails();
          const epoch = Math.floor(new Date().getTime() / 1000) - 86400;
          const response = await request(server)
            .post('/food/admin/menu/menu_item/20/createHolidaySlot')
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
          const new_date = new Date();
          const epoch = Math.floor(new_date.getTime() / 1000) + 86400;
          const response = await request(server)
            .post('/food/admin/menu/menu_item/4/createHolidaySlot')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toMatchObject({
            id: 4,
          });
          const read_menu_item = await DB.read('menu_item').where({id: 4});
          expect(read_menu_item[0].id).toBe(4);
          expect(read_menu_item[0].name).toBe('Chilli');
          expect(read_menu_item[0].sub_category_id).toBe(sub_category_id);
          expect(read_menu_item[0].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_menu_item[0].next_available_after).toStrictEqual(
            new Date(epoch * 1000)
          );
        });
        test('Successfuly HolidaySlot Remove Request', async () => {
          mockgetAdminDetails();
          const response = await request(server)
            .post('/food/admin/menu/menu_item/4/createHolidaySlot')
            .set('Authorization', `Bearer ${admin_token}`)
            .send({
              end_epoch: null,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toMatchObject({
            id: 4,
          });
          const read_menu_item = await DB.read('menu_item').where({id: 4});
          expect(read_menu_item[0].id).toBe(4);
          expect(read_menu_item[0].name).toBe('Chilli');
          expect(read_menu_item[0].sub_category_id).toBe(sub_category_id);
          expect(read_menu_item[0].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_menu_item[0].next_available_after).toBe(null);
        });
      });
      describe('DELETE | Menu Items', () => {
        test('Invalid Menu Item Id In Delete Request | Need to Throw Error', async () => {
          mockgetAdminDetails();
          mockdeleteMenuItemSQS();
          const response = await request(server)
            .delete('/food/admin/menu/menu_item/20')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Menu Item not found', code: 0},
          ]);
        });
        test('Successful Delete Request', async () => {
          mockgetAdminDetails();
          mockdeleteMenuItemSQS();
          const response = await request(server)
            .delete('/food/admin/menu/menu_item/4')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 4,
            restaurant_id: menu_valid_restaurant_id,
            name: 'Chilli',
            description: null,
            sub_category_id: sub_category_id,
            price: 12.5,
            veg_egg_non: 'veg',
            packing_charges: 12.5,
            is_spicy: true,
            serves_how_many: 2,
            service_charges: 12.5,
            item_sgst_utgst: 12.5,
            item_cgst: 12.5,
            item_igst: 12.5,
            item_inclusive: true,
            disable: false,
            external_id: 'ght-128978912bkj129',
            allow_long_distance: true,
            image: null,
            is_deleted: true,
            next_available_after: null,
            pos_id: null,
            tax_applied_on: 'core',
            pos_partner: null,
            sequence: 0,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });
          const read_menu_item = (await DB.read('menu_item').where({id: 4}))[0];
          expect(read_menu_item.id).toBe(4);
          expect(read_menu_item.name).toBe('Chilli');
          expect(read_menu_item.sub_category_id).toBe(sub_category_id);
          expect(read_menu_item.restaurant_id).toBe(menu_valid_restaurant_id);
          expect(read_menu_item.is_deleted).toBe(true);

          const read_variant_group = (
            await DB.read('item_variant_group').where({menu_item_id: 4})
          )[0];
          expect(read_variant_group.id).toBe(4);
          expect(read_variant_group.menu_item_id).toBe(4);
          expect(read_variant_group.name).toBe('South Indian');
          expect(read_variant_group.is_deleted).toBe(true);

          const read_variant = (
            await DB.read('item_variant').where({
              variant_group_id: 4,
            })
          )[0];
          expect(read_variant.id).toBe(4);
          expect(read_variant.variant_group_id).toBe(4);
          expect(read_variant.name).toBe('Thali');
          expect(read_variant.is_deleted).toBe(true);

          // item addon and item addon records will be removed also
        });
        test('Failed Delete Request >> Not found', async () => {
          mockgetAdminDetails();
          mockdeleteMenuItemSQS();
          const response = await request(server)
            .delete('/food/admin/menu/menu_item/4')
            .set('Authorization', `Bearer ${admin_token}`);
          expect(response.statusCode).toBe(404);
        });
      });
    });

    describe('Vendor Apis', () => {
      describe('POST | Menu Items', () => {
        test('Invalid Sub Category ID', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: 20,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              image: null,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: 'Sub Category Not Found', code: 0},
          ]);
        });
        test('Empty Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: ' ',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {message: '"name" is not allowed to be empty', code: 0},
          ]);
        });
        test('Adding Other Then veg_egg_non ', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'vegan',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
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
        test('Empty Variant Group', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"variant_groups" must contain at least 1 items',
              code: 0,
            },
          ]);
        });
        test('Empty Variant Group Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: ' ',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"variant_groups[0].name" is not allowed to be empty',
              code: 0,
            },
          ]);
        });
        test('Variant Groups Empty Variant', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message:
                '"variant_groups[0].variants" must contain at least 1 items',
              code: 0,
            },
          ]);
        });
        test('Variant Groups Variant Empty Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: ' ',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message:
                '"variant_groups[0].variants[0].name" is not allowed to be empty',
              code: 0,
            },
          ]);
        });
        test('Variant Groups Variant Sending Other Then Veg_Egg_Non', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'vegan',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message:
                '"variant_groups[0].variants[0].veg_egg_non" must be one of [veg, egg, non-veg]',
              code: 0,
            },
          ]);
        });
        test('Empty Addon Group', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"addon_groups" must contain at least 1 items',
              code: 0,
            },
          ]);
        });
        test('Invalid Addon Group Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: 89,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Addon Group Not Found',
              code: 0,
            },
          ]);
        });
        test('Empty Addons Of Addon Group Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: '"addon_groups[0].addons" must contain at least 1 items',
              code: 0,
            },
          ]);
        });
        test('Invalid Addons ID Of Addon Group Name', async () => {
          mockgetAdminDetails();
          mockputMenuItemSQS();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: 'Chilli',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: 200,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(404);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Addon Not Found',
              code: 0,
            },
          ]);
        });
        test('Successful Create Request', async () => {
          mockGenerateDownloadFileURL();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: 'Paratha',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            discount_rate: 0,
            menu_item_id: 5,
            restaurant_id: menu_valid_restaurant_id,
            menu_item_name: 'Paratha',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            sub_category_id: 5,
            sub_category_name: 'Sweet',
            description: null,
            price: 12.5,
            veg_egg_non: 'veg',
            packing_charges: 12.5,
            is_spicy: true,
            serves_how_many: 2,
            service_charges: 12.5,
            item_sgst_utgst: 12.5,
            item_cgst: 12.5,
            item_igst: 12.5,
            item_inclusive: true,
            image: {url: 'url'},
            disable: false,
            external_id: 'ght-128978912bkj129',
            allow_long_distance: true,
            next_available_after: null,
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 0,
            variant_groups: [
              {
                id: 5,
                variant_group_name: 'South Indian',
                sequence: 1,
                variants: [
                  {
                    id: 5,
                    variant_group_id: 5,
                    variant_name: 'Thali',
                    is_default: true,
                    price: 12.5,
                    veg_egg_non: 'veg',
                    in_stock: true,
                    serves_how_many: 1,
                    sequence: 1,
                  },
                ],
              },
            ],
            addon_groups: [
              {
                id: 4,
                addon_group_name: 'Popcorns',
                min_limit: -1,
                max_limit: 5,
                free_limit: -1,
                sequence: 90,
                addons: [
                  {
                    id: 5,
                    addon_name: 'savory-popcorns',
                    sequence: 91,
                    price: 12.5,
                    veg_egg_non: 'veg',
                    in_stock: false,
                    sgst_rate: 12.5,
                    cgst_rate: 12.5,
                    igst_rate: 12.5,
                    gst_inclusive: true,
                    external_id: 'ght-128978912bkj129',
                  },
                ],
              },
            ],
            menu_item_slots: null,
          });
          const read_menu_item = (await DB.read('menu_item').where({id: 5}))[0];
          expect(read_menu_item.id).toBe(5);
          expect(read_menu_item.name).toBe('Paratha');
          expect(read_menu_item.sub_category_id).toBe(sub_category_id);
          expect(read_menu_item.restaurant_id).toBe(menu_valid_restaurant_id);
        });
        test('Failed Create Request >> duplicate name', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              name: 'Paratha',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(400);
          expect(response.body.status).toBe(false);
          expect(response.body.errors).toStrictEqual([
            {
              message: 'Duplicate Item Name',
              code: 0,
            },
          ]);
        });
        describe('Creating Menu-Item Which Are Not Inclusive Of Taxes', () => {
          test('Successful Create Request | Creating menu-item with ', async () => {
            mockGenerateDownloadFileURL();
            const response = await request(server)
              .post('/food/vendor/menu/menu_item')
              .set('Authorization', `Bearer ${vendor_token}`)
              .send({
                sub_category_id: sub_category_id,
                name: 'Aloo-Parathas',
                price: 12.5,
                veg_egg_non: 'veg',
                packing_charges: 12.5,
                is_spicy: true,
                serves_how_many: 2,
                service_charges: 12.5,
                item_sgst_utgst: 12.5,
                item_cgst: 12.5,
                item_igst: 12.5,
                item_inclusive: true,
                external_id: 'ght-128978912bkj129',
                allow_long_distance: true,
                variant_groups: [
                  {
                    name: 'South Indian',
                    variants: [
                      {
                        name: 'Thali',
                        is_default: true,
                        in_stock: true,
                        price: 12.5,
                        veg_egg_non: 'veg',
                        serves_how_many: 1,
                      },
                    ],
                  },
                ],
                addon_groups: [
                  {
                    id: addon_group_id,
                    max_limit: 5,
                    min_limit: -1,
                    free_limit: -1,
                    sequence: 90,
                    addons: [
                      {
                        id: addon_id,
                      },
                    ],
                  },
                ],
              });
            expect(response.statusCode).toBe(201);
            expect(response.body.status).toBe(true);
            delete response.body.result.created_at;
            delete response.body.result.updated_at;
            expect(response.body.result).toStrictEqual({
              discount_rate: 0,
              menu_item_id: 6,
              restaurant_id: menu_valid_restaurant_id,
              menu_item_name: 'Aloo-Parathas',
              main_category_id: 2,
              main_category_name: 'Soft-Drinks',
              sub_category_id: 5,
              sub_category_name: 'Sweet',
              description: null,
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              image: {url: 'url'},
              disable: false,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              next_available_after: null,
              is_deleted: false,
              pos_id: null,
              pos_partner: null,
              sequence: 0,
              variant_groups: [
                {
                  id: 6,
                  variant_group_name: 'South Indian',
                  sequence: 1,
                  variants: [
                    {
                      id: 6,
                      variant_group_id: 6,
                      variant_name: 'Thali',
                      is_default: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      in_stock: true,
                      serves_how_many: 1,
                      sequence: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: 4,
                  addon_group_name: 'Popcorns',
                  min_limit: -1,
                  max_limit: 5,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: 5,
                      addon_name: 'savory-popcorns',
                      sequence: 91,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      in_stock: false,
                      sgst_rate: 12.5,
                      cgst_rate: 12.5,
                      igst_rate: 12.5,
                      gst_inclusive: true,
                      external_id: 'ght-128978912bkj129',
                    },
                  ],
                },
              ],
              menu_item_slots: null,
            });
          });
        });
      });
      describe('GET | Menu Items', () => {
        test('Successful Get Request', async () => {
          mockGenerateDownloadFileURL();
          const response = await request(server)
            .get('/food/vendor/menu/menu_item/5')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          expect(response.body.result).toStrictEqual({
            discount_rate: 0,
            menu_item_id: 5,
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            menu_item_name: 'Paratha',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            sub_category_id: 5,
            sub_category_name: 'Sweet',
            description: null,
            price: 12.5,
            veg_egg_non: 'veg',
            packing_charges: 12.5,
            is_spicy: true,
            serves_how_many: 2,
            service_charges: 12.5,
            item_sgst_utgst: 12.5,
            item_cgst: 12.5,
            item_igst: 12.5,
            item_inclusive: true,
            image: {url: 'url'},
            disable: false,
            external_id: 'ght-128978912bkj129',
            allow_long_distance: true,
            next_available_after: null,
            is_deleted: false,
            pos_id: null,
            pos_partner: null,
            sequence: 0,
            variant_groups: [
              {
                id: 5,
                variant_group_name: 'South Indian',
                sequence: 1,
                variants: [
                  {
                    id: 5,
                    variant_group_id: 5,
                    variant_name: 'Thali',
                    is_default: true,
                    price: 12.5,
                    veg_egg_non: 'veg',
                    in_stock: true,
                    serves_how_many: 1,
                    sequence: 1,
                  },
                ],
              },
            ],
            addon_groups: [
              {
                id: 4,
                addon_group_name: 'Popcorns',
                min_limit: -1,
                max_limit: 5,
                free_limit: -1,
                sequence: 90,
                addons: [
                  {
                    id: 5,
                    addon_name: 'savory-popcorns',
                    sequence: 91,
                    price: 12.5,
                    veg_egg_non: 'veg',
                    in_stock: false,
                    sgst_rate: 12.5,
                    cgst_rate: 12.5,
                    igst_rate: 12.5,
                    gst_inclusive: true,
                    external_id: 'ght-128978912bkj129',
                  },
                ],
              },
            ],
            menu_item_slots: null,
          });
        });
      });
      describe('PUT | Menu Items', () => {
        mockGenerateDownloadFileURL();
        test('Successful Update Request', async () => {
          const response = await request(server)
            .put('/food/vendor/menu/menu_item/3')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Parathas',
              image: null,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            discount_rate: 0,
            menu_item_id: 3,
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            menu_item_name: 'Parathas',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            sub_category_id: 5,
            sub_category_name: 'Sweet',
            description: null,
            price: 12.5,
            veg_egg_non: 'veg',
            packing_charges: 12.5,
            is_spicy: true,
            serves_how_many: 2,
            service_charges: 12.5,
            item_sgst_utgst: 12.5,
            item_cgst: 12.5,
            item_igst: 12.5,
            item_inclusive: true,
            image: {url: 'url'},
            disable: false,
            external_id: 'ght-128978912bkj129',
            allow_long_distance: true,
            next_available_after: null,
            is_deleted: false,
            pos_partner: null,
            variant_groups: null,
            addon_groups: [],
            menu_item_slots: null,
            pos_id: null,
            sequence: 0,
          });
        });
        test('Successful Update Request', async () => {
          const response = await request(server)
            .put('/food/vendor/menu/menu_item/3')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Parathas',
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            discount_rate: 0,
            menu_item_id: 3,
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            menu_item_name: 'Parathas',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            sub_category_id: 5,
            sub_category_name: 'Sweet',
            description: null,
            price: 12.5,
            veg_egg_non: 'veg',
            packing_charges: 12.5,
            is_spicy: true,
            serves_how_many: 2,
            service_charges: 12.5,
            item_sgst_utgst: 12.5,
            item_cgst: 12.5,
            item_igst: 12.5,
            item_inclusive: true,
            image: {url: 'url'},
            disable: false,
            external_id: 'ght-128978912bkj129',
            allow_long_distance: true,
            next_available_after: null,
            is_deleted: false,
            pos_partner: null,
            variant_groups: null,
            addon_groups: [],
            menu_item_slots: null,
            sequence: 0,
            pos_id: null,
          });
        });
      });
      describe('POST | Menu Items', () => {
        test('Successful Create Request', async () => {
          mockGenerateDownloadFileURL();
          const response = await request(server)
            .post('/food/vendor/menu/menu_item')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              sub_category_id: sub_category_id,
              restaurant_id: menu_valid_restaurant_id,
              name: 'Dahi-Paratha',
              price: 12.5,
              veg_egg_non: 'veg',
              packing_charges: 12.5,
              is_spicy: true,
              serves_how_many: 2,
              service_charges: 12.5,
              item_sgst_utgst: 12.5,
              item_cgst: 12.5,
              item_igst: 12.5,
              item_inclusive: true,
              external_id: 'ght-128978912bkj129',
              allow_long_distance: true,
              variant_groups: [
                {
                  name: 'South Indian',
                  variants: [
                    {
                      name: 'Thali',
                      is_default: true,
                      in_stock: true,
                      price: 12.5,
                      veg_egg_non: 'veg',
                      serves_how_many: 1,
                    },
                  ],
                },
              ],
              addon_groups: [
                {
                  id: addon_group_id,
                  max_limit: 5,
                  min_limit: -1,
                  free_limit: -1,
                  sequence: 90,
                  addons: [
                    {
                      id: addon_id,
                    },
                  ],
                },
              ],
            });
          expect(response.statusCode).toBe(201);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            discount_rate: 0,
            menu_item_id: 7,
            restaurant_id: menu_valid_restaurant_id,
            menu_item_name: 'Dahi-Paratha',
            sub_category_id: sub_category_id,
            description: null,
            price: 12.5,
            veg_egg_non: 'veg',
            main_category_id: 2,
            main_category_name: 'Soft-Drinks',
            packing_charges: 12.5,
            is_spicy: true,
            serves_how_many: 2,
            service_charges: 12.5,
            item_sgst_utgst: 12.5,
            item_cgst: 12.5,
            item_igst: 12.5,
            item_inclusive: true,
            image: {
              url: 'url',
            },
            disable: false,
            external_id: 'ght-128978912bkj129',
            allow_long_distance: true,
            next_available_after: null,
            is_deleted: false,
            sub_category_name: 'Sweet',
            pos_id: null,
            pos_partner: null,
            sequence: 0,
            variant_groups: [
              {
                id: 7,
                variant_group_name: 'South Indian',
                sequence: 1,
                variants: [
                  {
                    id: 7,
                    variant_group_id: 7,
                    variant_name: 'Thali',
                    is_default: true,
                    price: 12.5,
                    veg_egg_non: 'veg',
                    in_stock: true,
                    serves_how_many: 1,
                    sequence: 1,
                  },
                ],
              },
            ],
            addon_groups: [
              {
                id: addon_group_id,
                addon_group_name: 'Popcorns',
                min_limit: -1,
                max_limit: 5,
                free_limit: -1,
                sequence: 90,
                addons: [
                  {
                    id: addon_id,
                    addon_name: 'savory-popcorns',
                    sequence: 91,
                    price: 12.5,
                    veg_egg_non: 'veg',
                    in_stock: false,
                    sgst_rate: 12.5,
                    cgst_rate: 12.5,
                    igst_rate: 12.5,
                    gst_inclusive: true,
                    external_id: 'ght-128978912bkj129',
                  },
                ],
              },
            ],
            menu_item_slots: null,
          });
        });
      });
      describe('POST | Menu Item Holiday Slot', () => {
        test('Successful HolidaySlot Request', async () => {
          const epoch = Math.floor(new Date().getTime() / 1000) + 86400;
          const response = await request(server)
            .post('/food/vendor/menu/menu_item/3/createHolidaySlot')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              end_epoch: epoch,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toMatchObject({
            id: 3,
          });
          const read_menu_item = await DB.read('menu_item').where({id: 3});
          expect(read_menu_item[0].id).toBe(3);
          expect(read_menu_item[0].name).toBe('Parathas');
          expect(read_menu_item[0].sub_category_id).toBe(sub_category_id);
          expect(read_menu_item[0].restaurant_id).toBe(
            menu_valid_restaurant_id
          );
          expect(read_menu_item[0].next_available_after).toStrictEqual(
            new Date(epoch * 1000)
          );
        });
        test('Successfuly HolidaySlot Remove Request', async () => {
          const response = await request(server)
            .post('/food/vendor/menu/menu_item/7/createHolidaySlot')
            .set('Authorization', `Bearer ${vendor_token}`)
            .send({
              end_epoch: null,
            });
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toMatchObject({
            id: 7,
          });
        });
      });
      describe('DELETE | Menu Items', () => {
        test('Successful Delete Request', async () => {
          const response = await request(server)
            .delete('/food/vendor/menu/menu_item/7')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(200);
          expect(response.body.status).toBe(true);
          delete response.body.result.created_at;
          delete response.body.result.updated_at;
          expect(response.body.result).toStrictEqual({
            id: 7,
            restaurant_id: '77e53c1f-6e9e-4724-9ba7-92edc69cff6b',
            name: 'Dahi-Paratha',
            description: null,
            sub_category_id: 5,
            price: 12.5,
            veg_egg_non: 'veg',
            packing_charges: 12.5,
            is_spicy: true,
            serves_how_many: 2,
            service_charges: 12.5,
            item_sgst_utgst: 12.5,
            item_cgst: 12.5,
            item_igst: 12.5,
            item_inclusive: true,
            disable: false,
            external_id: 'ght-128978912bkj129',
            allow_long_distance: true,
            image: null,
            is_deleted: true,
            next_available_after: null,
            pos_id: null,
            tax_applied_on: 'core',
            pos_partner: null,
            sequence: 0,
            discount_rate: 0,
            discount_updated_at: null,
            discount_updated_user_id: null,
            discount_updated_user_type: null,
          });

          const read_menu_item = (await DB.read('menu_item').where({id: 7}))[0];
          expect(read_menu_item.id).toBe(7);
          expect(read_menu_item.name).toBe('Dahi-Paratha');
          expect(read_menu_item.sub_category_id).toBe(sub_category_id);
          expect(read_menu_item.restaurant_id).toBe(menu_valid_restaurant_id);
          expect(read_menu_item.is_deleted).toBe(true);

          const read_variant_group = (
            await DB.read('item_variant_group').where({menu_item_id: 7})
          )[0];
          expect(read_variant_group.id).toBe(7);
          expect(read_variant_group.menu_item_id).toBe(7);
          expect(read_variant_group.name).toBe('South Indian');
          expect(read_variant_group.is_deleted).toBe(true);

          const read_variant = (
            await DB.read('item_variant').where({
              variant_group_id: 7,
            })
          )[0];
          expect(read_variant.id).toBe(7);
          expect(read_variant.variant_group_id).toBe(7);
          expect(read_variant.name).toBe('Thali');
          expect(read_variant.is_deleted).toBe(true);
        });
        test('Failed Delete Request >> Not found', async () => {
          const response = await request(server)
            .delete('/food/vendor/menu/menu_item/7')
            .set('Authorization', `Bearer ${vendor_token}`);
          expect(response.statusCode).toBe(404);
        });
      });
    });
  });
};
