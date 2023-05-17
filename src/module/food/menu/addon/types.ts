import {IAddon} from './models';

export interface IAddonAndAddonGroup extends IAddon {
  addon_group_name: string;
}
