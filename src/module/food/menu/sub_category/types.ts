import {ISubCategory} from './models';

export interface ISubCategoryAndMainCategory extends ISubCategory {
  main_category_name: string;
}
