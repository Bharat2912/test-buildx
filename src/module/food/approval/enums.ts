export enum ApprovalAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum ApprovalEntityType {
  MAIN_CATEGORY = 'main_category',
  SUB_CATEGORY = 'sub_category',
  ADDON = 'addon',
  ADDON_GROUP = 'addon_group',
  MENU_ITEM = 'menu_item',
}

export enum ApprovalStatus {
  REVIEWED = 'reviewed',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

export enum OrderByColumn {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
}

export enum SortOrder {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
}
