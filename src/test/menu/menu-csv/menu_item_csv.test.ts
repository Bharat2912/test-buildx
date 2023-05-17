/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import {createTestServer} from '../../utils/init';
import {Application} from 'express';
import {
  signToken,
  loadMockSeedData,
  testCasesClosingTasks,
} from '../../utils/utils';
import logger from '../../../utilities/logger/winston_logger';
import {
  mockGetTempFileDataChangedMenuItemSuccess,
  mockGetTempFileDataCreatedMenuItemSuccess,
  mockGetTempFileDataInvalidRestaurantIDFail,
  mockGetTempFileDataInvalidMainCategoryFail,
  mockGetTempFileDataInvalidSubCategoryFail,
  mockGetTempFileDataInvalidMenuItemFail,
  mockGetTempFileDataChangeMenuItemSubCategorySuccess,
  mockGetTempFileDataChangeMenuItemCreateSubCategorySuccess,
  mockGetTempFileDataCreatedItemVariantSuccess,
  mockGetTempFileDataEmptyParentFail,
} from './mock_services';
import {mockEsIndexData, mockgetAdminDetails} from '../../utils/mock_services';
import {DB} from '../../../data/knex';
import {processMenuUpload} from '../../../module/food/menu/controller_csv';

let server: Application;
let admin_token: string;

beforeAll(async () => {
  server = await createTestServer();

  await loadMockSeedData('restaurant');
  await loadMockSeedData('restaurant_menu');
  logger.info('DataBase Connection Created For Testing');
  admin_token = signToken({
    id: '64bfafb6-c273-4b64-a0fc-ca981f5819eb',
    user_type: 'admin',
  });
});
afterAll(async () => {
  await testCasesClosingTasks();
});

jest.mock('axios');

describe('Menu CSV Testing :- ADMIN', () => {
  test('CSV Upload', async () => {
    const csv_data = `Restaurant_Id,Main_Category_Id,Main_Category_Name,Sub_Category_Id,Sub_Category_Name,Item_Id,Name,Description,Parent,Variant_Group_Id,Variant_Group_Name,Variant_Id,Variant_Default_Value,In_Stock,Price,Veg_Egg_Non,Packing_Charges,Is_Spicy,Serves_How_Many,Service_Charges_(%),Item_SGST_UTGST,Item_CGST,Item_IGST,Item_Inclusive,Disable,Delete,External_Id,Eligible_For_Long_Distance,Monday Open 1,Monday Close 1,Monday Open 2,Monday Close 2,Monday Open 3,Monday Close 3,Tuesday Open 1,Tuesday Close 1,Tuesday Open 2,Tuesday Close 2,Tuesday Open 3,Tuesday Close 3,Wednesday Open 1,Wednesday Close 1,Wednesday Open 2,Wednesday Close 2,Wednesday Open 3,Wednesday Close 3,Thursday Open 1,Thursday Close 1,Thursday Open 2,Thursday Close 2,Thursday Open 3,Thursday Close 3,Friday Open 1,Friday Close 1,Friday Open 2,Friday Close 2,Friday Open 3,Friday Close 3,Saturday Open 1,Saturday Close 1,Saturday Open 2,Saturday Close 2,Saturday Open 3,Saturday Close 3,Sunday Open 1,Sunday Close 1,Sunday Open 2,Sunday Close 2,Sunday Open 3,Sunday Close 3
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Wings,,Korean Chicken Wings [6 Pieces],,I1,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Wings,,Spiced Chicken Wings [6 Pieces],,I2,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Wings,,Bbq Chicken Wings [6 Pieces],,I3,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Wings,,Saoji Chicken Wings [6 Pieces],,I4,,,,,1,290,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Wings,,Chilli Oil Chicken Wings [6 Pieces],,I5,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Out Of The Box,,Double Decker Pizza [10 Inches],,I6,,,,,1,530,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Out Of The Box,,Spicy Thecha Bombs [6 Pieces],,I7,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Out Of The Box,,Ulta Vada Pav [6 Vada],,I8,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Out Of The Box,,Mushroom Keema Pizza [10 Inches],,I9,,,,,1,380,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Out Of The Box,,Cheese Stuffed Samosa [4 Pieces],,I10,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Out Of The Box,,Broccoli & Chicken Pizza [10 Inches],,I11,,,,,1,360,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Out Of The Box,,Chicken Keema Square Pizza [10 Inches],,I12,,,,,1,380,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Out Of The Box,,Chicken Keema Stuffed Samosa [4 Pieces],,I13,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Out Of The Box,,Chicken Triple Pizza [10 Inches],,I14,,,,,1,380,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Classic Maple Syrup Waffle,,I15,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Classic Honey Butter Waffle,,I16,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Strawberry Creme Waffle,,I17,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Peanut Butter Waffle,,I18,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Truffle Waffle,,I19,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Blueberry Creme Waffle,,I20,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Nutella Waffle,,I21,,,,,1,250,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Brownie Waffle,,I22,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Classic Waffle,,I23,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,White Chocolate Waffle,,I24,,,,,1,290,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Chocolate Indulgence Waffle,,I25,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Kitkat Waffle,,I26,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Triple Chocolate Waffle,,I27,,,,,1,330,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Waffles,,Chocolate Mocha Waffle,,I28,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Pancakes,,Nutella Pancake,,I29,,,,,1,250,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Pancakes,,Crunchy Kitkat Pancake,,I30,,,,,1,250,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Pancakes,,Maple Syrup And Honey Pancake,,I31,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Pancakes,,Chocolate Blast Pancake,,I32,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Smoothies & Shakes,,Kiwi Banana Smoothie,,I33,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Smoothies & Shakes,,Berry Merry Smoothie,,I34,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Smoothies & Shakes,,Peanut Butter Banana Smoothie,,I35,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Smoothies & Shakes,,Seasonal Fresh Fruit Smoothie,,I36,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Smoothies & Shakes,,Rasmalai Shake,,I37,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Smoothies & Shakes,,After 8 Mint Chocolate Shake,,I38,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Smoothies & Shakes,,Coffee Walnut Freakshake,,I39,,,,,1,250,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Smoothies & Shakes,,Strawberry Banana Smoothie,,I40,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Appetizers,,Hunan Paneer,,I41,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Appetizers,,Tom Yum Paneer,,I42,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Appetizers,,Paneer Six 555,,I43,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Appetizers,,Hunan Chicken,,I44,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Appetizers,,Tom Yum Chicken,,I45,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Appetizers,,Chicken Six 555,,I46,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Appetizers,,Roll On Chicken,,I47,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Feindooz Special,,Appetizers,,Hyderabadi Chicken Legs,,I48,,,,,1,380,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Lip Smakers,,Chilli Garlic Potato Shots,,I49,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Lip Smakers,,Assorted Veg Platter,,I50,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Lip Smakers,,Mozzarella Sticks,,I51,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Lip Smakers,,Pizza Sticks [10 Pieces],,I52,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Lip Smakers,,Peri Peri Chicken Popcorn,,I53,,,,,1,260,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Lip Smakers,,Jamaican Chicken Popcorn,,I54,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Lip Smakers,,Classic Fried Chicken Popcorn,,I55,,,,,1,230,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Lip Smakers,,Chicken Strips,,I56,,,,,1,290,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Lip Smakers,,Chicken Garlic Fingers,,I57,,,,,1,210,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Lip Smakers,,Fried Chicken Wings [3 Pieces] With Fried Chicken Lollipop [3 Pieces],,I58,,,,,1,250,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Lip Smakers,,Chicken Nuggets [8 Pieces],,I59,,,,,1,210,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Lip Smakers,,Assorted Chicken Platter,,I60,,,,,1,250,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Brushetta,,Classic Tomato Basil Bruschetta,,I61,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Brushetta,,Mushroom Bruschetta,,I62,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Brushetta,,Veg Ala Pizzeria Bruschetta,,I63,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Brushetta,,Chicken Ala Pizzeria Bruschetta,,I64,,,,,1,260,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Fries,,French Fries,,I65,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Fries,,Peri Peri Fries,,I66,,,,,1,240,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Fries,,Cheesy Fries,,I67,,,,,1,220,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Fries,,Cheesy Peri Peri Fries,,I68,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Fries,,Poutine Fries,,I69,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Fries,,Poutine Chicken Fries,,I70,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Fries,,Chicken Fries,,I71,,,,,1,210,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Nachos,,Crispy Cheesy Nachos,,I72,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Nachos,,Cheesy Jalapeno Nachos,,I73,,,,,1,250,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Nachos,,Classic Salsa Nachos,,I74,,,,,1,220,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Nachos,,Loaded Veg Nachos,,I75,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Nachos,,Nachos Cheesy Grande,,I76,,,,,1,250,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Instants,,Nachos,,Loaded Chicken Nachos,,I77,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Soups,,Non-Veg Soups,,Chicken Clear Soup,,I78,,,,,1,190,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Soups,,Non-Veg Soups,,Chicken Manchow Soup,,I79,,,,,1,190,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Soups,,Non-Veg Soups,,Chicken Hot N Sour Soup,,I80,,,,,1,190,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Soups,,Non-Veg Soups,,Chicken Lemon Coriander Soup,,I81,,,,,1,190,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Soups,,Non-Veg Soups,,Chicken Sweet Corn Soup,,I82,,,,,1,190,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Soups,,Veg Soups,,Veg Clear Soup,,I83,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Soups,,Veg Soups,,Veg Manchow Soup,,I84,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Soups,,Veg Soups,,Veg Hot N Sour Soup,,I85,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Soups,,Veg Soups,,Veg Lemon Coriander Soup,,I86,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Soups,,Veg Soups,,Veg Sweet Corn Soup,,I87,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Soups,,Veg Soups,,Cream Of Tomato Soup,,I88,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Chocolate,,Premium Hot Chocolate,,I89,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Chocolate,,Hazelnut Hot Chocolate,,I90,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Chocolate,,Nutella Hot Chocolate,,I91,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Chocolate,,Mint Hot Chocolate,,I92,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Chocolate,,Marshmellow Hot Chocolate,,I93,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Chocolate,,Turkish Cocoa Hot Chocolate,,I94,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Signature Coffee,,Creamy Cold Coffee,,I95,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Signature Coffee,,Dopio Coffee,,I96,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Signature Coffee,,Hazelnut Frappe,,I97,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Signature Coffee,,Classic Cold Frappe,,I98,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Signature Coffee,,Cold Rose Frappe,,I99,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Signature Coffee,,Choco Frappe,,I100,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Signature Coffee,,Oreo Frappe,,I101,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Signature Coffee,,Caramel Frappe,,I102,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Iced Coffee,,Mocha Iced Coffee,,I103,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Iced Coffee,,Americano Iced Coffee,,I104,,,,,1,160,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Iced Coffee,,Iced Caramel Latte,,I105,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Iced Coffee,,Iced Cafe Latte,,I106,,,,,1,150,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Iced Coffee,,Iced Hazelnut Latte,,I107,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Coffee,,Espresso,,I108,,,,,1,80,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Coffee,,Americano,,I109,,,,,1,120,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Coffee,,Hot Hazelnut Latte,,I110,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Coffee,,Hot Cafe Latte,,I111,,,,,1,160,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Coffee,,Cappuccino,,I112,,,,,1,160,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Coffee,,Mocha,,I113,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Hot Coffee,,Hazelnut Cappuccino,,I114,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Kadak Cold Chai,,I115,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Oreo Shake,,I116,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Nutella Shake,,I117,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Strawberry Shake,,I118,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Chocolate Shake,,I119,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Kitkat Shake,,I120,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Butterscotch Shake,,I121,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Choco Berry Shake,,I122,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Ferrero Rocher Shake,,I123,,,,,1,300,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Choco Nutty Shake,,I124,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Dark Chocolate Shake,,I125,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Pineapple Shake,,I126,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Mango Shake,,I127,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Paan Shake,,I128,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Fruit Punch Shake,,I129,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Brownie Shake,,I130,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Shakes,,Masala Lemonade,,I131,,,,,1,150,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Pink Valentine,,I132,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Blue Lagoon,,I133,,,,,1,160,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Refreshing Lychee,,I134,,,,,1,150,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Apple Lemon Fizz,,I135,,,,,1,150,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Pink Lavender,,I136,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Fresh Lime Soda,,I137,,,,,1,140,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Kiwi Float,,I138,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Miss Lychee,,I139,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Saffron Cream,,I140,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Watermelon Jalapeno Fusion,,I141,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Chilli Mango Soda,,I142,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Lemon Mint Mojito,,I143,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Green Apple Mojito,,I144,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Raspberry Mojito,,I145,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Fresh Watermelon Mojito,,I146,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Cranberry Soda,,I147,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Cranberry Cooler,,I148,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Dreamy Crenn Mocktail,,I149,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Cool As Cucumber,,I150,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Ice On Fire,,I151,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Lemon Ice Tea,,I152,,,,,1,150,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Peach Ice Tea,,I153,,,,,1,160,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Saffron Ice Tea,,I154,,,,,1,160,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Beverages,,Mocktails,,Watermelon Ice Tea,,I155,,,,,1,170,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza non veg,,Tandoori Chicken Pizza,,I156,,,,,1,300,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V156,,choice of inches,,1,1,0,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V156,,choice of inches,,0,1,60,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza non veg,,Balck Pepper Chicken Pizza,,I157,,,,,1,310,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V157,,choice of inches,,1,1,0,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V157,,choice of inches,,0,1,60,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza non veg,,Butter Chicken Pizza,,I158,,,,,1,330,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V158,,choice of inches,,1,1,0,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V158,,choice of inches,,0,1,60,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza non veg,,Chicken Overload Pizza,,I159,,,,,1,330,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V159,,choice of inches,,1,1,0,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V159,,choice of inches,,0,1,60,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza non veg,,Barbecue Chicken Pizza,,I160,,,,,1,300,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V160,,choice of inches,,1,1,0,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V160,,choice of inches,,0,1,60,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza non veg,,Peri Peri Chicken Pizza,,I161,,,,,1,290,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V161,,choice of inches,,1,1,0,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V161,,choice of inches,,0,1,60,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza non veg,,Chicken Tikka Pizza,,I162,,,,,1,320,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V162,,choice of inches,,1,1,0,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V162,,choice of inches,,0,1,50,Non-Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Margherita Pizza,,I163,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V163,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V163,,choice of inches,,0,1,60,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Spicy Farm Fresh Pizza,,I164,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V164,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V164,,choice of inches,,0,1,60,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Peri Peri Paneer Pizza,,I165,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V165,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V165,,choice of inches,,0,1,60,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Black Pepper Paneer Pizza,,I166,,,,,1,290,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V166,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V166,,choice of inches,,0,1,60,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Tandoori Paneer Pizza,,I167,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V167,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V167,,choice of inches,,0,1,70,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Cherry Tomato & Basil Pizza,,I168,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V168,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V168,,choice of inches,,0,1,70,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Tomato Onion Pizza,,I169,,,,,1,240,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V169,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V169,,choice of inches,,0,1,70,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Paneer Tikka Pizza,,I170,,,,,1,300,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V170,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V170,,choice of inches,,0,1,60,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Hawaiian Pizza,,I171,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V171,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V171,,choice of inches,,0,1,70,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Chilli Paneer Pizza,,I172,,,,,1,310,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V172,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V172,,choice of inches,,0,1,60,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Italian Pizza,,I173,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V173,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V173,,choice of inches,,0,1,70,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Corn Continental Pizza,,I174,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V74,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V174,,choice of inches,,0,1,60,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Veg Overload Pizza,,I175,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V175,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V175,,choice of inches,,0,1,50,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Paneer Barbecue Pizza,,I176,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V176,,choice of inches,,1,1,20,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V176,,choice of inches,,0,1,70,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pizza,,Pizza veg,,Chilli Mushroom Pizza,,I177,,,,,1,290,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Small (8 Inches),,V177,,choice of inches,,1,1,0,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,,,,,Large (10 Inches),,V177,,choice of inches,,0,1,60,Veg,0,0,1,0,,,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Veg Crispy Tandoori Paneer Burger,,I178,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Veg Mexican Burger,,I179,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Veggie Delight Burger,,I180,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Veg Cheese Burger,,I181,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Veg Chilli Lava Burger,,I182,,,,,1,180,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Veg Spicy Masala Treat Burger,,I183,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Egg Fun Burger,,I184,,,,,1,160,Egg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Jamaican Fried Chicken Burger,,I185,,,,,1,230,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Classic Fried Chicken Burger,,I186,,,,,1,230,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Chilli Cheese Chicken Burger,,I187,,,,,1,180,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Barbecue Chicken Burger,,I188,,,,,1,200,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Peri Peri Chicken Burger,,I189,,,,,1,180,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Burgers,,Burgers,,Tandoori Chicken Burger,,I190,,,,,1,180,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Buns & Burgers [Big],,Buns,,Jordar Korean Bun,,I191,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Buns & Burgers [Big],,Buns,,Pull Apart Garlic Bun,,I192,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Buns & Burgers [Big],,Buns,,Paneer Keema Stuffed Bun,,I193,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Buns & Burgers [Big],,Buns,,Chicken Keema Stuffed Bun,,I194,,,,,1,230,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Buns & Burgers [Big],,Bombers,,Veg Cheese Bomber,,I195,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Buns & Burgers [Big],,Bombers,,Paplon Cheese Bomber,,I196,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Buns & Burgers [Big],,Bombers,,Veg Bully Boy Bomber,,I197,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Buns & Burgers [Big],,Bombers,,Chicken Cheese Bomber,,I198,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Buns & Burgers [Big],,Bombers,,Bully Boy Chicken Bomber,,I199,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Buns & Burgers [Big],,Bombers,,Mutton Cheese Bomber,,I200,,,,,1,290,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Buns & Burgers [Big],,Bombers,,Spicy Chicken Cheese Bomber,,I201,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Toast Sandwiches,,Cheese Chilli Toast,,I202,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Toast Sandwiches,,Pizza Garlic Toast,,I203,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Toast Sandwiches,,Cheese Chilli Garlic Toast,,I204,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Toast Sandwiches,,Chicken Keema Toast,,I205,,,,,1,230,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Toast Sandwiches,,Chilli Cheese Chicken Toast,,I206,,,,,1,210,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Toast Sandwiches,,Chilli Chicken Toast,,I207,,,,,1,210,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Veggie Paneer Grilled Sandwich,,I208,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Cheesy Onion Grilled Sandwich,,I209,,,,,1,220,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Butter Paneer Masala Sandwich,,I210,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Cheese & Corn Sandwich,,I211,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Veg Cheese Grilled Sandwich,,I212,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Schezwan Paneer Sandwich,,I213,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Firangish Super Club Sandwich,,I214,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Paneer Tikka Sandwich,,I215,,,,,1,240,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Chilli Paneer Sandwich,,I216,,,,,1,240,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Veg Kebab Sandwich,,I217,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Cold Classic Club Sandwich,,I218,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Potato Cheese Sandwich,,I219,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Pizza Sandwich,,I220,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Melting Cheese Sandwich,,I221,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Veg Sandwiches,,Nawabi Paneer Sandwich,,I222,,,,,1,300,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Egg Bhurji Sandwich,,I223,,,,,1,200,Egg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Chicken Mayo Sandwich,,I224,,,,,1,210,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Chicken & Egg Club Sandwich,,I225,,,,,1,260,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Chicken Club Sandwich,,I226,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Tandoori Chicken Sandwich,,I227,,,,,1,220,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Chicken Cheese Sandwich,,I228,,,,,1,220,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Schezwan Chicken Sandwich,,I229,,,,,1,220,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Chicken Bhuna Sandwich,,I230,,,,,1,240,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Chicken Tikka Sandwich,,I231,,,,,1,250,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Butter Chicken Sandwich,,I232,,,,,1,250,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Chilli Chicken Sandwich,,I233,,,,,1,240,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Melting Chicken Sandwich,,I234,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Nawabi Chicken Sandwich,,I235,,,,,1,300,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sandwiches,,Non-Veg Sandwiches,,Chicken Bbq Sandwich,,I236,,,,,1,240,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Garlic Breads,,Garlic Breads,,Classic Butter Garlic Bread,,I237,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Garlic Breads,,Garlic Breads,,Melting Cheese Garlic Bread,,I238,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Garlic Breads,,Garlic Breads,,Corn & Cheese Garlic Bread,,I239,,,,,1,250,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Garlic Breads,,Garlic Breads,,Chicken Melting Cheese Garlic Bread,,I240,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Rolls,,Non-Veg Rolls,,Butter Chicken Roll,,I241,,,,,1,230,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Rolls,,Non-Veg Rolls,,Devils Chicken Roll,,I242,,,,,1,220,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Rolls,,Non-Veg Rolls,,Chicken Tikka Roll,,I243,,,,,1,220,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Rolls,,Non-Veg Rolls,,Crispy Chicken Roll,,I244,,,,,1,220,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Rolls,,Non-Veg Rolls,,Saoji Chicken Keema Roll,,I245,,,,,1,260,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Rolls,,Non-Veg Rolls,,Chicken Bhuna Roll,,I246,,,,,1,260,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Rolls,,Veg Rolls,,Butter Paneer Roll,,I247,,,,,1,220,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Rolls,,Veg Rolls,,Chilli Manchurian Roll,,I248,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Rolls,,Veg Rolls,,Chilli Paneer Roll,,I249,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Rolls,,Veg Rolls,,Paneer Tikka Roll,,I250,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Firangish Special Wrap,,I251,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Chatpata Masala Wrap,,I252,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Crunchy Veggie Wrap,,I253,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Spicy Paneer Wrap,,I254,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Mexican Cheese Wrap,,I255,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Pizza Wrap,,I256,,,,,1,200,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Egg Bhurji Wrap,,I257,,,,,1,180,Egg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Chicken Barbecue Wrap,,I258,,,,,1,190,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Spicy Mutton Keema Wrap,,I259,,,,,1,280,Non-Veg ,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Crispy Chicken Zinger Wrap,,I260,,,,,1,250,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Cheese Chicken Keema Wrap,,I261,,,,,1,250,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Tandoori Zinger Chicken Wrap,,I262,,,,,1,250,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Wraps,,Wraps,,Crunchy Chicken Wrap,,I263,,,,,1,200,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pasta,,Veg Pasta,,White Sauce Pasta,,I264,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pasta,,Veg Pasta,,Red Sauce Pasta,,I265,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pasta,,Veg Pasta,,Pink Sauce Pasta,,I266,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pasta,,Veg Pasta,,Veg Spaghetti Aglio Olio,,I267,,,,,1,330,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pasta,,Nonveg Pasta,,Chicken White Sauce Pasta,,I268,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pasta,,Nonveg Pasta,,Chicken Red Sauce Pasta,,I269,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pasta,,Nonveg Pasta,,Chicken Pink Sauce Pasta,,I270,,,,,1,300,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Pasta,,Nonveg Pasta,,Chicken Spaghetti Aglio Olio,,I271,,,,,1,370,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Pepperoni Veg,,I272,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Trippy Paneer,,I273,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Crispy Gold Coin With Schezwan Sauce,,I274,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Creamy Pepper Mushroom,,I275,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Creamy Pepper Paneer,,I276,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Oriental Sesame Veg,,I277,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,3 Pepper Paneer,,I278,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Kung Pao Paneer,,I279,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Veg Chinese Bhel,,I280,,,,,1,190,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Devil'S Paneer,,I281,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Sunset Chicken,,I282,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Trippy Chicken,,I283,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Creamy Pepper Chicken,,I284,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,3 Pepper Chicken,,I285,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Kung Pao Chicken,,I286,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Chicken Chinese Bhel,,I287,,,,,1,210,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Appetizers,,Chef'S Special Appetizers,,Devil'S Chicken,,I288,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Crispy Veg,,I289,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Crispy Lovely Corn,,I290,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Chilli Paneer,,I291,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Crispy Paneer,,I292,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Green Pepper Paneer,,I293,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Chilli Mushroom,,I294,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Mushroom 65,,I295,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Chilli Manchurian,,I296,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Caesars 65,,I297,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Chilli Baby Corn,,I298,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Baby Corn 65,,I299,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Crispy Honey Chilli Potato,,I300,,,,,1,240,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Crispy Honey Chilli Paneer,,I301,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Lemon Honey Paneer,,I302,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Hot Garlic Paneer,,I303,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Hong Kong Paneer,,I304,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Paneer Garlic Black Pepper,,I305,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Cheese Cigar [6 Pieces],,I306,,,,,1,330,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Black Pepper American Corn,,I307,,,,,1,240,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Green Pepper Chicken,,I308,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Crispy Chicken,,I309,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Hot Garlic Chicken,,I310,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Chilli Chicken,,I311,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Lemon Honey Chicken,,I312,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Hong Kong Chicken,,I313,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Drums Of Heaven,,I314,,,,,1,360,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Crispy Honey Chilli Chicken,,I315,,,,,1,290,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Chicken Garlic Black Pepper,,I316,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Crispy Chicken Lollipop [6 Pieces],,I317,,,,,1,310,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Appetizers,,Appetizers,,Chicken Lollipop Tossed In Schezwan Sauce,,I318,,,,,1,330,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chinese - Malaysian Speciality,,Chinese,,Malaysian Paneer Fried Rice,,I319,,,,,1,310,Veg ,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chinese - Malaysian Speciality,,Chinese,,Chopper Rice Paneer,,I320,,,,,1,310,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chinese - Malaysian Speciality,,Chinese,,Malaysian Chicken Fried Rice,,I321,,,,,1,310,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chinese - Malaysian Speciality,,Chinese,,Chicken Meatballs With Rice,,I322,,,,,1,310,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chinese - Malaysian Speciality,,Chinese,,Chopper Rice Chicken,,I323,,,,,1,310,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Veg Fried Rice,,I324,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Veg Burnt Garlic Fried Rice,,I325,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Hong Kong Fried Rice Veg,,I326,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Mexican Fried Rice Veg,,I327,,,,,1,300,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Triple Schezwan Fried Rice Veg,,I328,,,,,1,300,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Chilli Garlic Fried Rice Veg,,I329,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Schezwan Fried Rice Veg,,I330,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Chicken Fried Rice,,I331,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Mexican Fried Rice Chicken,,I332,,,,,1,320,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Triple Schezwan Fried Rice Chicken,,I333,,,,,1,320,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Schezwan Fried Rice Chicken,,I334,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Burnt Garlic Fried Rice Chicken,,I335,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Hong Kong Fried Rice Chicken,,I336,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Surprise Chicken Fried Rice,,I337,,,,,1,330,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Fried Rice,,Chilli Garlic Fried Rice Chicken,,I338,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Veg Hakka Noodles,,I339,,,,,1,260,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Manchurian Noodles Veg,,I340,,,,,1,300,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Schezwan Noodles Veg,,I341,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Triple Schezwan Noodles Veg,,I342,,,,,1,300,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Chilli Garlic Noodles Veg,,I343,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Veg Hong Kong Noodles,,I344,,,,,1,300,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Veg Burnt Garlic Noodles,,I345,,,,,1,270,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Schezwan Noodles Chicken,,I346,,,,,1,280,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Manchurian Noodles Chicken,,I347,,,,,1,320,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Triple Schezwan Noodles Chicken,,I348,,,,,1,320,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Chicken Hong Kong Noodles,,I349,,,,,1,310,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Chicken Chilli Garlic Noodles,,I350,,,,,1,290,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Chicken Hakka Noodles,,I351,,,,,1,270,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Fried Rice and Noodles,,Noodles,,Chicken Burnt Garlic Noodles,,I352,,,,,1,290,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Mexican Rice With Spicy Salsa Sauce (Paneer),,I353,,,,,1,370,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Mexican Rice With Spicy Salsa Sauce (Chicken),,I354,,,,,1,370,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Chilli Paneer Fried Rice [1 Bowl],,I355,,,,,1,330,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Mixed Fruit Salad,,I356,,,,,1,250,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Seasonal Fruit Bowl,,I357,,,,,1,250,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Fragrant Paneer Pot Fried Rice,,I358,,,,,1,370,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Spinach Rice With Tandoori Sauce Paneer,,I359,,,,,1,380,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Creamy Paneer Italian Rice,,I360,,,,,1,380,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Paneer Grilled Peri Peri Platter,,I361,,,,,1,380,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Chicken Breast With Herbed Rice,,I362,,,,,1,370,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Basil Chicken Rice With Shashlik Sauce,,I363,,,,,1,370,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Chilli Chicken Fried Rice [1 Bowl],,I364,,,,,1,330,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Spinach Rice With Tandoori Sauce Chicken,,I365,,,,,1,380,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Fragrant Chicken Pot Fried Rice,,I366,,,,,1,370,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Creamy Chicken Italian Rice,,I367,,,,,1,380,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Chef's Special Platters,,Chef'S Special Platters,,Grilled Chicken Peri Peri Platter,,I368,,,,,1,380,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Italian Sizzler Veg With Rice,"In House Special Creamy White Sauce Pasta Served With Garlic Bread, Sauteed Veggies And Fries",I369,,,,,1,390,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Italian Sizzler Veg With Noodles,"In House Special Creamy White Sauce Pasta Served With Garlic Bread, Sauteed Veggies And Fries",I370,,,,,1,390,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Mexican Sizzler Veg With Rice,"In House Special Red Sauce, Sauteed Veggies And Fries",I371,,,,,1,390,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Mexican Sizzler Veg With Noodles,"In House Special Red Sauce, Sauteed Veggies And Fries",I372,,,,,1,390,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Oriental Sizzler Veg With Rice,Served With In House Special Creamy Spinach Sauce With Sauteed Veggies And Fries,I373,,,,,1,390,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Oriental Sizzler Veg With Noodles,Served With In House Special Creamy Spinach Sauce With Sauteed Veggies And Fries,I374,,,,,1,390,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Chinese Sizzler Veg With Rice,"Served With Chilli Paneer, Sauteed Veggies And Fries",I375,,,,,1,390,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Chinese Sizzler Veg With Noodles,"Served With Chilli Paneer, Sauteed Veggies And Fries",I376,,,,,1,390,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Firangish Special Sizzler Veg With Rice,"Served With In House Special Pink Sauce With Veg Patty ,Sauteed Veggies And Fries",I377,,,,,1,390,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Firangish Special Sizzler Veg With Noodles,"Served With In House Special Pink Sauce With Veg Patty ,Sauteed Veggies And Fries",I378,,,,,1,390,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Italian Sizzler Chicken With Rice,In House Special Creamy White Sauce Chicken Pasta Served With Garlic Bread.,I379,,,,,1,410,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Italian Sizzler Chicken With Noodles,In House Special Creamy White Sauce Chicken Pasta Served With Garlic Bread.,I380,,,,,1,410,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Mexican Sizzler Chicken With Rice,"In House Special Red Sauce, Sauteed Veggies And Fries",I381,,,,,1,410,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Mexican Sizzler Chicken With Noodles,"In House Special Red Sauce, Sauteed Veggies And Fries",I382,,,,,1,410,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Oriental Sizzler Chicken With Rice,Served With In House Special Creamy Spinach Sauce With Sauteed Veggies And Fries,I383,,,,,1,410,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Oriental Sizzler Chicken With Noodles,Served With In House Special Creamy Spinach Sauce With Sauteed Veggies And Fries,I384,,,,,1,410,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Chinese Sizzler Chicken With Rice,"Served With Chilli Chicken, Sauteed Veggies And Fries",I385,,,,,1,410,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Chinese Sizzler Chicken With Noodles,"Served With Chilli Chicken, Sauteed Veggies And Fries",I386,,,,,1,410,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Firangish Special Sizzler Chicken With Rice,"Served With In House Special Pink Sauce With Grilled Chicken ,Sauteed Veggies And Fries",I387,,,,,1,410,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Sizzlers,,Firangish Special Sizzler Chicken With Noodles,"Served With In House Special Pink Sauce With Grilled Chicken ,Sauteed Veggies And Fries",I388,,,,,1,410,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Shashlik Sizzlers,,Paneer Shashlik Sizzler With Rice,Served With In House Special Creamy Shaslik Sauce With Sauteed Veggies And Fries.,I389,,,,,1,380,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Shashlik Sizzlers,,Paneer Shashlik Sizzler With Noodles,Served With In House Special Creamy Shaslik Sauce With Sauteed Veggies And Fries.,I390,,,,,1,380,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Shashlik Sizzlers,,Chicken Shaslik Sizzler With Rice,Served With In House Special Creamy Shaslik Sauce With Sauteed Veggies And Fries.,I391,,,,,1,410,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Sizzlers,,Shashlik Sizzlers,,Chicken Shaslik Sizzler With Noodles,Served With In House Special Creamy Shaslik Sauce With Sauteed Veggies And Fries.,I392,,,,,1,410,Non-Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Desserts,,Desserts,,Wicked Walnut Brownie,,I393,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Desserts,,Desserts,,Sizzling Brownie With Ice Cream,,I394,,,,,1,240,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Desserts,,Desserts,,Death By Chocolate Sundae,,I395,,,,,1,280,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Desserts,,Desserts,,Cad B,,I396,,,,,1,210,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Desserts,,Desserts,,Brownie Cad B,,I397,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Desserts,,Desserts,,Dry Nuts Cad B,,I398,,,,,1,230,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Desserts,,Desserts,,5 Layer Truffle Bliss,,I399,,,,,1,250,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    b0909e52-a731-4665-a791-ee6479008805,,Desserts,,Desserts,,Vanilla Ice Cream With Hot Fudge [2 Scoops],,I400,,,,,1,180,Veg,0,0,1,0,2.5,2.5,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
    `;
    mockEsIndexData();
    await processMenuUpload(csv_data, {is_partial: false});
  });
  describe('Get Restaurant Menu Items In CSV File | GET /food/admin/menu/csv/menu_item/{restaurant_ids}', () => {
    test('Token Not Provided | Need To Throw Error', async () => {
      const response = await request(server).get(
        "/food/admin/menu/csv/menu_item/['b0909e52-a731-4665-a791-ee6479008804']"
      );
      expect(response.body.statusCode).toBe(401);
      expect(response.body.status).toBe(false);
      expect(response.body.errors).toStrictEqual([
        {message: 'Authorization Error', code: 0},
      ]);
    });
    test('GET Restaurant Menu Items', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const response = await request(server)
        .get(
          "/food/admin/menu/csv/menu_item/['b0909e52-a731-4665-a791-ee6479008804']"
        )
        .set('Authorization', `Bearer ${admin_token}`);

      expect(response.statusCode).toBe(200);
      expect(response.ok).toBe(true);
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
  });
  describe('Menu Item Using CSV | POST /food/admin/menu/csv/menu_item', () => {
    test('Upload Temp CSV File Name | Restaurant Not Found', async () => {
      const mock_get_admin_details = mockgetAdminDetails();
      const mock_restaurant_id_not_found_fail =
        mockGetTempFileDataInvalidRestaurantIDFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: '82afe749-8217-47e3-b3ed-67cd3dea27a3.csv',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors[0].data).toMatchObject({
        'Row (2)': [
          {
            column_name: 'Restaurant_Id',
            error: 'invalid',
            details: 'Data:[00a0980a-946f-45ca-82e7-8c80c24cccf0]',
          },
        ],
      });
      expect(mock_restaurant_id_not_found_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Main Category Not Found', async () => {
      const main_category_db_read_before = await DB.read('main_category').where(
        {
          id: 10,
        }
      );
      expect(main_category_db_read_before.length).toEqual(0);

      const mock_get_admin_details = mockgetAdminDetails();
      const mock_main_category_not_found_fail =
        mockGetTempFileDataInvalidMainCategoryFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: '82afe749-8217-47e3-b3ed-67cd3dea27a3.csv',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors[0].data).toMatchObject({
        'Row (2)': [
          {
            column_name: 'Main_Category_Id',
            details: 'Data:[8]',
            error: 'invalid',
          },
        ],
      });
      expect(mock_main_category_not_found_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Sub Category Not Found', async () => {
      const sub_category_db_read_before = await DB.read('sub_category').where({
        id: 10,
      });
      expect(sub_category_db_read_before.length).toEqual(0);

      const mock_get_admin_details = mockgetAdminDetails();
      const mock_sub_category_not_found_fail =
        mockGetTempFileDataInvalidSubCategoryFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: '82afe749-8217-47e3-b3ed-67cd3dea27a3.csv',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors[0].data).toMatchObject({
        'Row (2)': [
          {
            column_name: 'Sub_Category_Id',
            details: 'Data:[10]',
            error: 'invalid',
          },
        ],
      });
      expect(mock_sub_category_not_found_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Updated Sub Category Of Menu Item', async () => {
      const menu_item_db_read_before = await DB.read('menu_item').where({
        id: 11102,
      });
      expect(menu_item_db_read_before[0].sub_category_id).toBe(111);

      const mock_get_admin_details = mockgetAdminDetails();
      const mock__menu_item_change_sub_category_success =
        mockGetTempFileDataChangeMenuItemSubCategorySuccess();
      const mock_es_index_data = mockEsIndexData();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: '82afe749-8217-47e3-b3ed-67cd3dea27a3.csv',
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.Main_Category.Created).toEqual(0);
      expect(response.body.result.Main_Category.Modified).toEqual(1);
      expect(response.body.result.Sub_Category.Created).toEqual(0);
      expect(response.body.result.Sub_Category.Modified).toEqual(1);
      expect(response.body.result.Menu_Item.Created).toEqual(0);
      expect(response.body.result.Menu_Item.Modified).toEqual(1);
      expect(response.body.result.Variant_Group.Created).toEqual(0);
      expect(response.body.result.Variant_Group.Modified).toEqual(0);
      expect(response.body.result.Variant.Created).toEqual(0);
      expect(response.body.result.Variant.Modified).toEqual(0);
      expect(mock_es_index_data).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
      expect(mock__menu_item_change_sub_category_success).toHaveBeenCalled();

      const menu_item_db_read_after = await DB.read('menu_item').where({
        id: 11102,
      });
      expect(menu_item_db_read_after[0].sub_category_id).toBe(111);
    });
    test('Upload Temp CSV File Name | Created New Sub Category Of Menu Item', async () => {
      const menu_item_db_read_before = await DB.read('sub_category').where({
        name: 'New Sub Category Using CSV File',
      });
      expect(menu_item_db_read_before.length).toEqual(0);

      const mock_get_admin_details = mockgetAdminDetails();
      const mock__menu_item_change_sub_category_success =
        mockGetTempFileDataChangeMenuItemCreateSubCategorySuccess();
      const mock_es_index_data = mockEsIndexData();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: '82afe749-8217-47e3-b3ed-67cd3dea27a3.csv',
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.Main_Category.Created).toEqual(0);
      expect(response.body.result.Main_Category.Modified).toEqual(0);
      expect(response.body.result.Sub_Category.Created).toEqual(1);
      expect(response.body.result.Sub_Category.Modified).toEqual(0);
      expect(response.body.result.Menu_Item.Created).toEqual(1);
      expect(response.body.result.Menu_Item.Modified).toEqual(0);
      expect(response.body.result.Variant_Group.Created).toEqual(0);
      expect(response.body.result.Variant_Group.Modified).toEqual(0);
      expect(response.body.result.Variant.Created).toEqual(0);
      expect(response.body.result.Variant.Modified).toEqual(0);
      expect(mock_es_index_data).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
      expect(mock__menu_item_change_sub_category_success).toHaveBeenCalled();

      const menu_item_db_read_after = await DB.read('sub_category').where({
        name: 'New Sub Category Using CSV File',
      });
      expect(menu_item_db_read_after.length).toEqual(1);
    });
    test('Upload Temp CSV File Name | Menu Item Not Found', async () => {
      const menu_item_db_read_before = await DB.read('menu_item').where({
        id: 11105,
      });
      expect(menu_item_db_read_before.length).toEqual(0);

      const mock_get_admin_details = mockgetAdminDetails();
      const mock_menu_item_not_found_fail =
        mockGetTempFileDataInvalidMenuItemFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: '82afe749-8217-47e3-b3ed-67cd3dea27a3.csv',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors[0].data).toMatchObject({
        'Row (2)': [
          {
            column_name: 'Item_Id',
            details: 'Data:[11100]',
            error: 'invalid',
          },
        ],
      });
      expect(mock_menu_item_not_found_fail).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();
    });
    test('Upload Temp CSV File Name | Updated Menu Item | Change Name | Change Price', async () => {
      const menu_item_db_read_before = await DB.read('menu_item').where({
        id: 11101,
      });
      expect(menu_item_db_read_before[0].name).toBe('Veg Burger');
      expect(menu_item_db_read_before[0].price).toEqual(100);

      const mock_get_admin_details = mockgetAdminDetails();
      const mock__menu_item_changed_success =
        mockGetTempFileDataChangedMenuItemSuccess();
      const mock_es_index_data = mockEsIndexData();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: '82afe749-8217-47e3-b3ed-67cd3dea27a3.csv',
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.Main_Category.Created).toEqual(0);
      expect(response.body.result.Main_Category.Modified).toEqual(0);
      expect(response.body.result.Sub_Category.Created).toEqual(0);
      expect(response.body.result.Sub_Category.Modified).toEqual(1);
      expect(response.body.result.Menu_Item.Created).toEqual(0);
      expect(response.body.result.Menu_Item.Modified).toEqual(1);
      expect(response.body.result.Variant_Group.Created).toEqual(0);
      expect(response.body.result.Variant_Group.Modified).toEqual(0);
      expect(response.body.result.Variant.Created).toEqual(0);
      expect(response.body.result.Variant.Modified).toEqual(0);
      expect(mock__menu_item_changed_success).toHaveBeenCalled();
      expect(mock_es_index_data).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();

      const menu_item_db_read_after = await DB.read('menu_item').where({
        id: 11101,
      });
      expect(menu_item_db_read_after[0].name).toBe('Menu Item Using CSV File');
      expect(menu_item_db_read_after[0].price).toEqual(150);
    });
    test('Upload Temp CSV File Name | Created New Menu Item', async () => {
      const menu_item_db_read_before = await DB.read('menu_item').where({
        name: 'Created New Menu Item Using CSV File',
      });
      expect(menu_item_db_read_before.length).toBe(0);

      const mock_get_admin_details = mockgetAdminDetails();
      const mock__menu_item_created_success =
        mockGetTempFileDataCreatedMenuItemSuccess();
      const mock_es_index_data = mockEsIndexData();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: '82afe749-8217-47e3-b3ed-67cd3dea27a3.csv',
        });
      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result.Main_Category.Created).toEqual(0);
      expect(response.body.result.Main_Category.Modified).toEqual(0);
      expect(response.body.result.Sub_Category.Created).toEqual(0);
      expect(response.body.result.Sub_Category.Modified).toEqual(0);
      expect(response.body.result.Menu_Item.Created).toEqual(1);
      expect(response.body.result.Menu_Item.Modified).toEqual(0);
      expect(response.body.result.Variant_Group.Created).toEqual(0);
      expect(response.body.result.Variant_Group.Modified).toEqual(0);
      expect(response.body.result.Variant.Created).toEqual(0);
      expect(response.body.result.Variant.Modified).toEqual(0);
      expect(mock__menu_item_created_success).toHaveBeenCalled();
      expect(mock_es_index_data).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();

      const menu_item_db_read_after = await DB.read('menu_item').where({
        name: 'Created New Menu Item Using CSV File',
        sub_category_id: 111,
      });
      expect(menu_item_db_read_after.length).toBe(1);
    });
    test('Upload Temp CSV File Name | Modified Menu Item | Created New Variant Group | Created New Variant', async () => {
      const variant_group_db_read_before = await DB.read(
        'item_variant_group'
      ).where({
        name: 'CSV Variant Group',
      });
      expect(variant_group_db_read_before.length).toEqual(0);
      const variant_db_read_before = await DB.read('item_variant').where({
        name: 'newvariant xx',
      });
      expect(variant_db_read_before.length).toEqual(0);

      const mock_get_admin_details = mockgetAdminDetails();
      const mock__menu_item_created_success =
        mockGetTempFileDataCreatedItemVariantSuccess();

      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: '82afe749-8217-47e3-b3ed-67cd3dea27a3.csv',
        });

      expect(response.body.status).toBe(true);
      expect(response.body.statusCode).toBe(201);
      expect(response.body.message).toBe('Successful Response');
      expect(response.body.result).toMatchObject({
        Main_Category: {Created: 0, Modified: 0},
        Sub_Category: {Created: 0, Modified: 0},
        Menu_Item: {Created: 0, Modified: 1},
        Variant_Group: {Created: 1, Modified: 0},
        Variant: {Created: 1, Modified: 0},
      });
      expect(mock__menu_item_created_success).toHaveBeenCalled();
      expect(mock_get_admin_details).toHaveBeenCalled();

      const variant_group_db_read_after = await DB.read(
        'item_variant_group'
      ).where({
        name: 'CSV Variant Group',
      });
      expect(variant_group_db_read_after.length).toEqual(1);
      const variant_db_read_after = await DB.read('item_variant').where({
        name: 'newvariant xx',
      });
      expect(variant_db_read_after.length).toEqual(1);
    });
    test('Empty Parent Column | Need to throw error', async () => {
      const mock_empty_parent_menu_item_fail =
        mockGetTempFileDataEmptyParentFail();
      const response = await request(server)
        .post('/food/admin/menu/csv/menu_item/')
        .set('Authorization', `Bearer ${admin_token}`)
        .send({
          csv_file_name: '82afe749-8217-47e3-b3ed-67cd3dea27a3.csv',
        });
      expect(response.body.status).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.errors).toStrictEqual([
        {
          code: 0,
          message: 'Error found in uploaded file',
          data: {
            'Row (2)': [
              {column_name: 'Parent', details: 'Data:[]', error: 'invalid'},
            ],
          },
        },
      ]);
      expect(mock_empty_parent_menu_item_fail).toHaveBeenCalled();
    });
    test('CSV Upload', async () => {
      const csv_data = `Restaurant_Id,Main_Category_Id,Main_Category_Name,Sub_Category_Id,Sub_Category_Name,Item_Id,Name,Description,Parent,Variant_Group_Id,Variant_Group_Name,Variant_Id,Variant_Default_Value,In_Stock,Price,Veg_Egg_Non,Packing_Charges,Is_Spicy,Serves_How_Many,Service_Charges_(%),Item_SGST_UTGST,Item_CGST,Item_IGST,Item_Inclusive,Disable,Delete,External_Id,Eligible_For_Long_Distance,Monday Open 1,Monday Close 1,Monday Open 2,Monday Close 2,Monday Open 3,Monday Close 3,Tuesday Open 1,Tuesday Close 1,Tuesday Open 2,Tuesday Close 2,Tuesday Open 3,Tuesday Close 3,Wednesday Open 1,Wednesday Close 1,Wednesday Open 2,Wednesday Close 2,Wednesday Open 3,Wednesday Close 3,Thursday Open 1,Thursday Close 1,Thursday Open 2,Thursday Close 2,Thursday Open 3,Thursday Close 3,Friday Open 1,Friday Close 1,Friday Open 2,Friday Close 2,Friday Open 3,Friday Close 3,Saturday Open 1,Saturday Close 1,Saturday Open 2,Saturday Close 2,Saturday Open 3,Saturday Close 3,Sunday Open 1,Sunday Close 1,Sunday Open 2,Sunday Close 2,Sunday Open 3,Sunday Close 3
        b0909e52-a731-4665-a791-ee6479008805,,Main Course,,VEG,,Paneer Kadai,null,I16,,,,,,346,veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,Main Course,,NON-VEG,,Chicken Mughlai Tandoori Chilly,null,I17,,,,,,374,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,Main Course,,NON-VEG,,Boneless Mutton Chingari,null,I18,,,,,,451,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,Main Course,,NON-VEG,,Boneless Chicken Lara,null,I19,,,,,,394,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,Main Course,,NON-VEG,,Chicken Chilly,null,I20,,,,,,218,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,,,,,Gravy,,V20,,Preparation type,,1,1,10,non-veg,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,,,,,Dry,,V20,,Preparation type,,0,1,10,non-veg,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,Seafood,,NOTA,,Prawns Manchurian,null,I271,,,,,,445,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,,,,,Gravy,,V271,,Preparation type,,1,1,10,non-veg,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,,,,,Dry,,V271,,Preparation type,,0,1,10,non-veg,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,Seafood,,NOTA,,Prawns Koliwada,null,I272,,,,,,489,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,Seafood,,NOTA,,Prawns Kadai,null,I273,,,,,,489,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,Seafood,,NOTA,,Prawns Ginger,null,I274,,,,,,445,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,,,,,Gravy,,V274,,Preparation type,,1,1,10,non-veg,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
        b0909e52-a731-4665-a791-ee6479008805,,,,,,Dry,,V274,,Preparation type,,0,1,10,non-veg,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,`;
      mockEsIndexData();
      await processMenuUpload(csv_data, {is_partial: false});

      const main_categories = await DB.read('main_category')
        .select(['id', 'name', 'sequence'])
        .where({
          is_deleted: false,
          restaurant_id: 'b0909e52-a731-4665-a791-ee6479008805',
        })
        .orderBy('sequence', 'asc');

      expect(main_categories).toStrictEqual([
        {
          id: 200,
          name: 'main category name 2',
          sequence: 0,
        },
        {
          id: 100,
          name: 'main category name',
          sequence: 1,
        },
        {
          id: 1,
          name: 'Main Course',
          sequence: 1,
        },
        {
          id: 2,
          name: 'Seafood',
          sequence: 2,
        },
      ]);

      let sub_categories = await DB.read('sub_category')
        .select(['id', 'name', 'sequence'])
        .where({
          is_deleted: false,
        })
        .whereIn('main_category_id', [1])
        .orderBy('sequence', 'asc');
      expect(sub_categories).toStrictEqual([
        {
          id: 2,
          name: 'VEG',
          sequence: 1,
        },
        {
          id: 3,
          name: 'NON-VEG',
          sequence: 2,
        },
      ]);
      sub_categories = await DB.read('sub_category')
        .select(['id', 'name', 'sequence'])
        .where({
          is_deleted: false,
        })
        .whereIn('main_category_id', [2])
        .orderBy('sequence', 'asc');
      expect(sub_categories).toStrictEqual([
        {
          id: 4,
          name: 'NOTA',
          sequence: 1,
        },
      ]);

      const menu_items = await DB.read('menu_item')
        .select(['id', 'name', 'sequence'])
        .where({
          is_deleted: false,
        })
        .whereIn('sub_category_id', [4])
        .orderBy('sequence', 'asc');
      expect(menu_items).toStrictEqual([
        {
          id: 8,
          name: 'Prawns Manchurian',
          sequence: 1,
        },
        {
          id: 9,
          name: 'Prawns Koliwada',
          sequence: 2,
        },
        {
          id: 10,
          name: 'Prawns Kadai',
          sequence: 3,
        },
        {
          id: 11,
          name: 'Prawns Ginger',
          sequence: 4,
        },
      ]);

      const variant_group = await DB.read('item_variant_group')
        .select(['id', 'name', 'sequence'])
        .where({
          is_deleted: false,
          menu_item_id: 11,
        })
        .orderBy('sequence', 'asc');
      expect(variant_group).toStrictEqual([
        {
          id: 4,
          name: 'Preparation type',
          sequence: 1,
        },
      ]);

      const variant = await DB.read('item_variant')
        .select(['id', 'name', 'sequence'])
        .where({
          is_deleted: false,
          variant_group_id: 3,
        })
        .orderBy('sequence', 'asc');
      expect(variant).toStrictEqual([
        {
          id: 4,
          name: 'Gravy',
          sequence: 1,
        },
        {
          id: 5,
          name: 'Dry',
          sequence: 2,
        },
      ]);
    });
  });
});
