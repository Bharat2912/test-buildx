import Joi from 'joi';
import {SearchType} from './enum';

const coordinates = Joi.object({
  lat: Joi.number().required(),
  long: Joi.number().required(),
});

const pagination = Joi.object({
  page_index: Joi.number().required(),
  page_size: Joi.number().required(),
});

//!DEPRECATED
export const search = Joi.object({
  searchText: Joi.string().min(3),
  coordinates: coordinates.required(),
  pagination: pagination,
});

export const search_v2 = Joi.object({
  type: Joi.string()
    .valid(
      SearchType.RESTAURANT,
      SearchType.MENU_ITEM_RESTAURANT,
      SearchType.CUISINE_RESTAURANT
    )
    .default(SearchType.MENU_ITEM_RESTAURANT),
  search_text: Joi.string().min(3),
  coordinates: coordinates.required(),
  pagination: pagination,
});
