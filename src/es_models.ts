import {SQSMessage} from './utilities/sqs_manager';
import logger from './utilities/logger/winston_logger';
import {put, put_bulk, remove, remove_bulk} from './utilities/es_manager';
import {IES_Restaurant} from './module/food/restaurant/models';
import {getIndexMenuItemByIds, IES_MenuItem} from './module/food/menu/models';

export async function esPutBulkRestaurants(restaurants: IES_Restaurant[]) {
  try {
    logger.info('Indexing Restaurant put bulk');
    const result = await put_bulk('restaurant', restaurants);
    logger.info('Indexing put bulk Restaurants ES documents response', {
      took: result.took,
      errors: result.errors,
      items_count: result.items.length,
    });
    if (result.errors) {
      logger.error(
        'Indexing put bulk Resturant ES documents Result Error',
        result.errors
      );
      throw result;
    }
  } catch (error) {
    logger.error('Indexing put bulk resturant ES documents error', error);
    throw error;
  }
}

async function esPutRestaurant(restaurant: IES_Restaurant) {
  try {
    logger.info('Creating Updating Restaurants');
    const result = await put('restaurant', restaurant.id, restaurant);
    logger.info('put restaurant ES', result);
  } catch (error) {
    logger.error('Indexing Indexing put resturant  Error', error);
    throw 'Indexing Indexing put resturant Error';
  }
}

async function esDeleteRestaurants(restaurant_id: string) {
  try {
    logger.info('Removing Restaurants');
    const result = await remove('restaurant', restaurant_id);
    logger.info('Delete Restaurant', result);
  } catch (error) {
    logger.error('Indexing Delete Restaurant Error', error);
    throw 'Indexing Delete Restaurant Error';
  }
}

export async function esPutBulkMenuItems(menu_items: IES_MenuItem[]) {
  try {
    logger.info('Indexing Menu Items');
    const result = await put_bulk('menu_item', menu_items);
    if (result.errors) throw 'Indexing Menu Items Failed';
    logger.info('Indexing menu items response', {
      took: result.took,
      errors: result.errors,
      items_count: result.items.length,
    });
  } catch (error) {
    logger.error('Indexing Bulk Put Menu Item Error', error);
    throw error;
  }
}
export async function esDeleteMenuItems(menu_item_ids: number[]) {
  try {
    logger.info('Removing Menu Items');
    const result = await remove_bulk(
      'menu_item',
      menu_item_ids.map(id => id + '')
    );
    logger.info('', result);
  } catch (error) {
    logger.error('Indexing Delete Menu Item Error', error);
    throw 'Indexing Delete Menu Item Error';
  }
}
async function esPutMenuItem(menu_item: IES_MenuItem) {
  try {
    logger.info('Creating Updating MenuItem');
    const result = await put('menu_item', menu_item.id + '', menu_item);
    logger.info('', result);
  } catch (error) {
    logger.error('Indexing put Menu Item Error', error);
    throw 'Indexing put Menu Item Error';
  }
}

async function esDeleteMenuItem(menu_item_id: number) {
  try {
    logger.info('Removing Menu Items');
    const result = await remove('menu_item', menu_item_id + '');
    logger.info('', result);
  } catch (error) {
    logger.error('Indexing Delete Menu Item Error', error);
    throw 'Indexing Delete Menu Item Error';
  }
}
export async function processSQSMessageData(msg: SQSMessage) {
  if (msg.event === 'RESTAURANT') {
    if (msg.action === 'PUT') {
      await esPutRestaurant(msg.data);
    } else if (msg.action === 'DELETE') {
      await esDeleteRestaurants(msg.data.id);
    } else {
      throw "msg.action !== 'PUT' | 'DELETE'";
    }
  } else if (msg.event === 'MENUITEM') {
    if (msg.action === 'PUT') {
      await esPutMenuItem(msg.data);
    } else if (msg.action === 'DELETE') {
      await esDeleteMenuItem(msg.data.id);
    } else if (msg.action === 'BULK_PUT') {
      const menu_items = await getIndexMenuItemByIds(msg.data.ids);
      await esPutBulkMenuItems(menu_items);
    } else if (msg.action === 'BULK_DELETE') {
      await esDeleteMenuItems(msg.data.ids);
    } else {
      logger.error(
        "msg.action !== 'BULK_PUT' | 'BULK_DELETE' | 'PUT' | 'DELETE'"
      );
      throw "msg.action !== 'BULK_PUT' | 'BULK_DELETE' | 'PUT' | 'DELETE'";
    }
  } else {
    logger.error("msg.event !== 'RESTAURANT' | 'MENUITEM'");
    throw "msg.event !== 'RESTAURANT' | 'MENUITEM'";
  }
}
