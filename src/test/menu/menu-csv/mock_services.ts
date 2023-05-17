import * as s3manager from '../../../utilities/s3_manager';

/* MENU ITEM */
export function mockGetTempFileDataCreatedMenuItemSuccess() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Main_Category_Id,Main_Category_Name,Sub_Category_Id,Sub_Category_Name,Item_Id,Name,Description,Parent,Variant_Group_Id,Variant_Group_Name,Variant_Id,Variant_Default_Value,In_Stock,Price,Veg_Egg_Non,Packing_Charges,Is_Spicy,Serves_How_Many,Service_Charges_(%),Item_SGST_UTGST,Item_CGST,Item_IGST,Item_Inclusive,Disable,Delete,External_Id,Eligible_For_Long_Distance,Monday Open 1,Monday Close 1,Monday Open 2,Monday Close 2,Monday Open 3,Monday Close 3,Tuesday Open 1,Tuesday Close 1,Tuesday Open 2,Tuesday Close 2,Tuesday Open 3,Tuesday Close 3,Wednesday Open 1,Wednesday Close 1,Wednesday Open 2,Wednesday Close 2,Wednesday Open 3,Wednesday Close 3,Thursday Open 1,Thursday Close 1,Thursday Open 2,Thursday Close 2,Thursday Open 3,Thursday Close 3,Friday Open 1,Friday Close 1,Friday Open 2,Friday Close 2,Friday Open 3,Friday Close 3,Saturday Open 1,Saturday Close 1,Saturday Open 2,Saturday Close 2,Saturday Open 3,Saturday Close 3,Sunday Open 1,Sunday Close 1,Sunday Open 2,Sunday Close 2,Sunday Open 3,Sunday Close 3\nb0909e52-a731-4665-a791-ee6479008805,100,main category name,111,sub category name,,"Created New Menu Item Using CSV File",null,I1,,,,,,381,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n'
      );
    })
  );
  return mock_function;
}
export function mockGetTempFileDataChangedMenuItemSuccess() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Main_Category_Id,Main_Category_Name,Sub_Category_Id,Sub_Category_Name,Item_Id,Name,Description,Parent,Variant_Group_Id,Variant_Group_Name,Variant_Id,Variant_Default_Value,In_Stock,Price,Veg_Egg_Non,Packing_Charges,Is_Spicy,Serves_How_Many,Service_Charges_(%),Item_SGST_UTGST,Item_CGST,Item_IGST,Item_Inclusive,Disable,Delete,External_Id,Eligible_For_Long_Distance,Monday Open 1,Monday Close 1,Monday Open 2,Monday Close 2,Monday Open 3,Monday Close 3,Tuesday Open 1,Tuesday Close 1,Tuesday Open 2,Tuesday Close 2,Tuesday Open 3,Tuesday Close 3,Wednesday Open 1,Wednesday Close 1,Wednesday Open 2,Wednesday Close 2,Wednesday Open 3,Wednesday Close 3,Thursday Open 1,Thursday Close 1,Thursday Open 2,Thursday Close 2,Thursday Open 3,Thursday Close 3,Friday Open 1,Friday Close 1,Friday Open 2,Friday Close 2,Friday Open 3,Friday Close 3,Saturday Open 1,Saturday Close 1,Saturday Open 2,Saturday Close 2,Saturday Open 3,Saturday Close 3,Sunday Open 1,Sunday Close 1,Sunday Open 2,Sunday Close 2,Sunday Open 3,Sunday Close 3\nb0909e52-a731-4665-a791-ee6479008805,100,main category name,111,sub category name,11101,"Menu Item Using CSV File",null,I1,,,,,,150,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n'
      );
    })
  );
  return mock_function;
}
export function mockGetTempFileDataChangeMenuItemCreateSubCategorySuccess() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Main_Category_Id,Main_Category_Name,Sub_Category_Id,Sub_Category_Name,Item_Id,Name,Description,Parent,Variant_Group_Id,Variant_Group_Name,Variant_Id,Variant_Default_Value,In_Stock,Price,Veg_Egg_Non,Packing_Charges,Is_Spicy,Serves_How_Many,Service_Charges_(%),Item_SGST_UTGST,Item_CGST,Item_IGST,Item_Inclusive,Disable,Delete,External_Id,Eligible_For_Long_Distance,Monday Open 1,Monday Close 1,Monday Open 2,Monday Close 2,Monday Open 3,Monday Close 3,Tuesday Open 1,Tuesday Close 1,Tuesday Open 2,Tuesday Close 2,Tuesday Open 3,Tuesday Close 3,Wednesday Open 1,Wednesday Close 1,Wednesday Open 2,Wednesday Close 2,Wednesday Open 3,Wednesday Close 3,Thursday Open 1,Thursday Close 1,Thursday Open 2,Thursday Close 2,Thursday Open 3,Thursday Close 3,Friday Open 1,Friday Close 1,Friday Open 2,Friday Close 2,Friday Open 3,Friday Close 3,Saturday Open 1,Saturday Close 1,Saturday Open 2,Saturday Close 2,Saturday Open 3,Saturday Close 3,Sunday Open 1,Sunday Close 1,Sunday Open 2,Sunday Close 2,Sunday Open 3,Sunday Close 3\nb0909e52-a731-4665-a791-ee6479008805,100,main category name,,New Sub Category Using CSV File,,"menu item name 3","Creating New Sub Category",I1,,,,,,120,veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n'
      );
    })
  );
  return mock_function;
}
export function mockGetTempFileDataChangeMenuItemSubCategorySuccess() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Main_Category_Id,Main_Category_Name,Sub_Category_Id,Sub_Category_Name,Item_Id,Name,Description,Parent,Variant_Group_Id,Variant_Group_Name,Variant_Id,Variant_Default_Value,In_Stock,Price,Veg_Egg_Non,Packing_Charges,Is_Spicy,Serves_How_Many,Service_Charges_(%),Item_SGST_UTGST,Item_CGST,Item_IGST,Item_Inclusive,Disable,Delete,External_Id,Eligible_For_Long_Distance,Monday Open 1,Monday Close 1,Monday Open 2,Monday Close 2,Monday Open 3,Monday Close 3,Tuesday Open 1,Tuesday Close 1,Tuesday Open 2,Tuesday Close 2,Tuesday Open 3,Tuesday Close 3,Wednesday Open 1,Wednesday Close 1,Wednesday Open 2,Wednesday Close 2,Wednesday Open 3,Wednesday Close 3,Thursday Open 1,Thursday Close 1,Thursday Open 2,Thursday Close 2,Thursday Open 3,Thursday Close 3,Friday Open 1,Friday Close 1,Friday Open 2,Friday Close 2,Friday Open 3,Friday Close 3,Saturday Open 1,Saturday Close 1,Saturday Open 2,Saturday Close 2,Saturday Open 3,Saturday Close 3,Sunday Open 1,Sunday Close 1,Sunday Open 2,Sunday Close 2,Sunday Open 3,Sunday Close 3\nb0909e52-a731-4665-a791-ee6479008805,100,main category name,111,sub category name 2,11102,"menu item name 2",null,I1,,,,,,120,veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n'
      );
    })
  );
  return mock_function;
}
export function mockGetTempFileDataCreatedItemVariantSuccess() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Main_Category_Id,Main_Category_Name,Sub_Category_Id,Sub_Category_Name,Item_Id,Name,Description,Parent,Variant_Group_Id,Variant_Group_Name,Variant_Id,Variant_Default_Value,In_Stock,Price,Veg_Egg_Non,Packing_Charges,Is_Spicy,Serves_How_Many,Service_Charges_(%),Item_SGST_UTGST,Item_CGST,Item_IGST,Item_Inclusive,Disable,Delete,External_Id,Eligible_For_Long_Distance,Monday Open 1,Monday Close 1,Monday Open 2,Monday Close 2,Monday Open 3,Monday Close 3,Tuesday Open 1,Tuesday Close 1,Tuesday Open 2,Tuesday Close 2,Tuesday Open 3,Tuesday Close 3,Wednesday Open 1,Wednesday Close 1,Wednesday Open 2,Wednesday Close 2,Wednesday Open 3,Wednesday Close 3,Thursday Open 1,Thursday Close 1,Thursday Open 2,Thursday Close 2,Thursday Open 3,Thursday Close 3,Friday Open 1,Friday Close 1,Friday Open 2,Friday Close 2,Friday Open 3,Friday Close 3,Saturday Open 1,Saturday Close 1,Saturday Open 2,Saturday Close 2,Saturday Open 3,Saturday Close 3,Sunday Open 1,Sunday Close 1,Sunday Open 2,Sunday Close 2,Sunday Open 3,Sunday Close 3\nb0909e52-a731-4665-a791-ee6479008805,100,main category name,111,sub category name,11104,"menu item name 4",null,I1,,,,true,true,381,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\nb0909e52-a731-4665-a791-ee6479008805,,,,,,newvariant xx,"variant desc ",V1,,CSV Variant Group,,1,1,11,non-veg,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n'
      );
    })
  );
  return mock_function;
}
export function mockGetTempFileDataInvalidRestaurantIDFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Main_Category_Id,Main_Category_Name,Sub_Category_Id,Sub_Category_Name,Item_Id,Name,Description,Parent,Variant_Group_Id,Variant_Group_Name,Variant_Id,Variant_Default_Value,In_Stock,Price,Veg_Egg_Non,Packing_Charges,Is_Spicy,Serves_How_Many,Service_Charges_(%),Item_SGST_UTGST,Item_CGST,Item_IGST,Item_Inclusive,Disable,Delete,External_Id,Eligible_For_Long_Distance,Monday Open 1,Monday Close 1,Monday Open 2,Monday Close 2,Monday Open 3,Monday Close 3,Tuesday Open 1,Tuesday Close 1,Tuesday Open 2,Tuesday Close 2,Tuesday Open 3,Tuesday Close 3,Wednesday Open 1,Wednesday Close 1,Wednesday Open 2,Wednesday Close 2,Wednesday Open 3,Wednesday Close 3,Thursday Open 1,Thursday Close 1,Thursday Open 2,Thursday Close 2,Thursday Open 3,Thursday Close 3,Friday Open 1,Friday Close 1,Friday Open 2,Friday Close 2,Friday Open 3,Friday Close 3,Saturday Open 1,Saturday Close 1,Saturday Open 2,Saturday Close 2,Saturday Open 3,Saturday Close 3,Sunday Open 1,Sunday Close 1,Sunday Open 2,Sunday Close 2,Sunday Open 3,Sunday Close 3\n00a0980a-946f-45ca-82e7-8c80c24cccf0,1,main category name,111,sub category name,,"Creating Menu Item Using CSV File","Restaurant Not Found",I1,,,,,,381,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n'
      );
    })
  );
  return mock_function;
}
export function mockGetTempFileDataInvalidMainCategoryFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Main_Category_Id,Main_Category_Name,Sub_Category_Id,Sub_Category_Name,Item_Id,Name,Description,Parent,Variant_Group_Id,Variant_Group_Name,Variant_Id,Variant_Default_Value,In_Stock,Price,Veg_Egg_Non,Packing_Charges,Is_Spicy,Serves_How_Many,Service_Charges_(%),Item_SGST_UTGST,Item_CGST,Item_IGST,Item_Inclusive,Disable,Delete,External_Id,Eligible_For_Long_Distance,Monday Open 1,Monday Close 1,Monday Open 2,Monday Close 2,Monday Open 3,Monday Close 3,Tuesday Open 1,Tuesday Close 1,Tuesday Open 2,Tuesday Close 2,Tuesday Open 3,Tuesday Close 3,Wednesday Open 1,Wednesday Close 1,Wednesday Open 2,Wednesday Close 2,Wednesday Open 3,Wednesday Close 3,Thursday Open 1,Thursday Close 1,Thursday Open 2,Thursday Close 2,Thursday Open 3,Thursday Close 3,Friday Open 1,Friday Close 1,Friday Open 2,Friday Close 2,Friday Open 3,Friday Close 3,Saturday Open 1,Saturday Close 1,Saturday Open 2,Saturday Close 2,Saturday Open 3,Saturday Close 3,Sunday Open 1,Sunday Close 1,Sunday Open 2,Sunday Close 2,Sunday Open 3,Sunday Close 3\nb0909e52-a731-4665-a791-ee6479008805,0008,main category name,111,sub category name,,"Creating Menu Item Using CSV File","Main Category Not Found",I1,,,,,,381,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n'
      );
    })
  );
  return mock_function;
}
export function mockGetTempFileDataInvalidSubCategoryFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Main_Category_Id,Main_Category_Name,Sub_Category_Id,Sub_Category_Name,Item_Id,Name,Description,Parent,Variant_Group_Id,Variant_Group_Name,Variant_Id,Variant_Default_Value,In_Stock,Price,Veg_Egg_Non,Packing_Charges,Is_Spicy,Serves_How_Many,Service_Charges_(%),Item_SGST_UTGST,Item_CGST,Item_IGST,Item_Inclusive,Disable,Delete,External_Id,Eligible_For_Long_Distance,Monday Open 1,Monday Close 1,Monday Open 2,Monday Close 2,Monday Open 3,Monday Close 3,Tuesday Open 1,Tuesday Close 1,Tuesday Open 2,Tuesday Close 2,Tuesday Open 3,Tuesday Close 3,Wednesday Open 1,Wednesday Close 1,Wednesday Open 2,Wednesday Close 2,Wednesday Open 3,Wednesday Close 3,Thursday Open 1,Thursday Close 1,Thursday Open 2,Thursday Close 2,Thursday Open 3,Thursday Close 3,Friday Open 1,Friday Close 1,Friday Open 2,Friday Close 2,Friday Open 3,Friday Close 3,Saturday Open 1,Saturday Close 1,Saturday Open 2,Saturday Close 2,Saturday Open 3,Saturday Close 3,Sunday Open 1,Sunday Close 1,Sunday Open 2,Sunday Close 2,Sunday Open 3,Sunday Close 3\nb0909e52-a731-4665-a791-ee6479008805,100,main category name,010,sub category name,,"Creating Menu Item Using CSV File","Sub Category Not Found",I1,,,,,,381,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n'
      );
    })
  );
  return mock_function;
}
export function mockGetTempFileDataInvalidMenuItemFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Main_Category_Id,Main_Category_Name,Sub_Category_Id,Sub_Category_Name,Item_Id,Name,Description,Parent,Variant_Group_Id,Variant_Group_Name,Variant_Id,Variant_Default_Value,In_Stock,Price,Veg_Egg_Non,Packing_Charges,Is_Spicy,Serves_How_Many,Service_Charges_(%),Item_SGST_UTGST,Item_CGST,Item_IGST,Item_Inclusive,Disable,Delete,External_Id,Eligible_For_Long_Distance,Monday Open 1,Monday Close 1,Monday Open 2,Monday Close 2,Monday Open 3,Monday Close 3,Tuesday Open 1,Tuesday Close 1,Tuesday Open 2,Tuesday Close 2,Tuesday Open 3,Tuesday Close 3,Wednesday Open 1,Wednesday Close 1,Wednesday Open 2,Wednesday Close 2,Wednesday Open 3,Wednesday Close 3,Thursday Open 1,Thursday Close 1,Thursday Open 2,Thursday Close 2,Thursday Open 3,Thursday Close 3,Friday Open 1,Friday Close 1,Friday Open 2,Friday Close 2,Friday Open 3,Friday Close 3,Saturday Open 1,Saturday Close 1,Saturday Open 2,Saturday Close 2,Saturday Open 3,Saturday Close 3,Sunday Open 1,Sunday Close 1,Sunday Open 2,Sunday Close 2,Sunday Open 3,Sunday Close 3\nb0909e52-a731-4665-a791-ee6479008805,100,main category name,111,sub category name,11100,"Updating Menu Item Using CSV File","Menu Item Not Found",I1,,,,,,381,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n'
      );
    })
  );
  return mock_function;
}
export function mockGetTempFileDataEmptyParentFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Main_Category_Id,Main_Category_Name,Sub_Category_Id,Sub_Category_Name,Item_Id,Name,Description,Parent,Variant_Group_Id,Variant_Group_Name,Variant_Id,Variant_Default_Value,In_Stock,Price,Veg_Egg_Non,Packing_Charges,Is_Spicy,Serves_How_Many,Service_Charges_(%),Item_SGST_UTGST,Item_CGST,Item_IGST,Item_Inclusive,Disable,Delete,External_Id,Eligible_For_Long_Distance,Monday Open 1,Monday Close 1,Monday Open 2,Monday Close 2,Monday Open 3,Monday Close 3,Tuesday Open 1,Tuesday Close 1,Tuesday Open 2,Tuesday Close 2,Tuesday Open 3,Tuesday Close 3,Wednesday Open 1,Wednesday Close 1,Wednesday Open 2,Wednesday Close 2,Wednesday Open 3,Wednesday Close 3,Thursday Open 1,Thursday Close 1,Thursday Open 2,Thursday Close 2,Thursday Open 3,Thursday Close 3,Friday Open 1,Friday Close 1,Friday Open 2,Friday Close 2,Friday Open 3,Friday Close 3,Saturday Open 1,Saturday Close 1,Saturday Open 2,Saturday Close 2,Saturday Open 3,Saturday Close 3,Sunday Open 1,Sunday Close 1,Sunday Open 2,Sunday Close 2,Sunday Open 3,Sunday Close 3\nb0909e52-a731-4665-a791-ee6479008805,1,main category name,11,sub category name,11101,"Menu Item Using CSV File",null,,,,,,,150,non-veg,10,0,2,12.5,12.5,12.5,12.5,0,0,,xyz,0,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,\n'
      );
    })
  );
  return mock_function;
}

/* MENU ITEM ADDON GROUP*/
export function mockItemAddonGroupDataInvalidRestaurantFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Item_Id,AddonGroup_Id,AddonGroup_Name,Max_Limit,Min_Limit,Free_Limit,Order\n00a0980a-946f-45ca-82e7-8c80c24cccf0,11102,77,addon group name,3,0,-1,0'
      );
    })
  );
  return mock_function;
}
export function mockItemAddonGroupDataItemIdEmptyFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Item_Id,AddonGroup_Id,AddonGroup_Name,Max_Limit,Min_Limit,Free_Limit,Order\nb0909e52-a731-4665-a791-ee6479008805,,70,addon group name,3,0,-1,0'
      );
    })
  );
  return mock_function;
}
export function mockItemAddonGroupDataInvalidItemIdFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Item_Id,AddonGroup_Id,AddonGroup_Name,Max_Limit,Min_Limit,Free_Limit,Order\nb0909e52-a731-4665-a791-ee6479008805,11120,77,addon group name,3,0,-1,0'
      );
    })
  );
  return mock_function;
}
export function mockItemAddonGroupDataEmptyAddonGroupIdFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Item_Id,AddonGroup_Id,AddonGroup_Name,Max_Limit,Min_Limit,Free_Limit,Order\nb0909e52-a731-4665-a791-ee6479008805,11102,,addon group name 5,3,0,-1,0'
      );
    })
  );
  return mock_function;
}
export function mockItemAddonGroupDataInvalidAddonGroupIDFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Item_Id,AddonGroup_Id,AddonGroup_Name,Max_Limit,Min_Limit,Free_Limit,Order\nb0909e52-a731-4665-a791-ee6479008805,11102,1,addon group name,3,0,-1,0'
      );
    })
  );
  return mock_function;
}
export function mockItemAddonGroupDataAddedAddonGroupSuccess() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Item_Id,AddonGroup_Id,AddonGroup_Name,Max_Limit,Min_Limit,Free_Limit,Order\nb0909e52-a731-4665-a791-ee6479008805,11102,77,addon group name,3,0,-1,0'
      );
    })
  );
  return mock_function;
}
export function mockItemAddonGroupDataChangeAddonGroupSuccess() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Item_Id,AddonGroup_Id,AddonGroup_Name,Max_Limit,Min_Limit,Free_Limit,Order\nb0909e52-a731-4665-a791-ee6479008805,11101,77,addon group name,2,0,-1,0'
      );
    })
  );
  return mock_function;
}

/*MENU ITEM ADDON*/
export function mockItemAddonDataInvalidRestaurantFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Items_Id,AddonGroup_Id,AddonGroup_Name,Addon_Id,Addon_Name,Addon_Order,Addon_Price,Addon_IsVeg,Addon_Instock,Addon_SGST,Addon_CGST,Addon_IGST,Addon_Inclusive,Delete,External_Addon_Id\n00a0980a-946f-45ca-82e7-8c80c24cccf0,11102,77,addon group name,7767,addon name 1,1,7.00,veg,1,0,0,0,1,,xyz'
      );
    })
  );
  return mock_function;
}
export function mockItemAddonDataInvalidMenuItemFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Items_Id,AddonGroup_Id,AddonGroup_Name,Addon_Id,Addon_Name,Addon_Order,Addon_Price,Addon_IsVeg,Addon_Instock,Addon_SGST,Addon_CGST,Addon_IGST,Addon_Inclusive,Delete,External_Addon_Id\nb0909e52-a731-4665-a791-ee6479008805,11105,77,addon group name,7767,addon name 1,1,7.00,veg,1,0,0,0,1,,xyz'
      );
    })
  );
  return mock_function;
}
export function mockItemAddonDataInvalidAddonGroupFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Items_Id,AddonGroup_Id,AddonGroup_Name,Addon_Id,Addon_Name,Addon_Order,Addon_Price,Addon_IsVeg,Addon_Instock,Addon_SGST,Addon_CGST,Addon_IGST,Addon_Inclusive,Delete,External_Addon_Id\nb0909e52-a731-4665-a791-ee6479008805,11102,78,addon group name,7767,addon name 1,1,7.00,veg,1,0,0,0,1,,xyz'
      );
    })
  );
  return mock_function;
}
export function mockItemAddonDataInvalidAddonFail() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Items_Id,AddonGroup_Id,AddonGroup_Name,Addon_Id,Addon_Name,Addon_Order,Addon_Price,Addon_IsVeg,Addon_Instock,Addon_SGST,Addon_CGST,Addon_IGST,Addon_Inclusive,Delete,External_Addon_Id\nb0909e52-a731-4665-a791-ee6479008805,11102,77,addon group name,7760,addon name 1,1,7.00,veg,1,0,0,0,1,,xyz'
      );
    })
  );
  return mock_function;
}
export function mockItemAddonDataUpdateItemAddonSuccess() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Items_Id,AddonGroup_Id,AddonGroup_Name,Addon_Id,Addon_Name,Addon_Order,Addon_Price,Addon_IsVeg,Addon_Instock,Addon_SGST,Addon_CGST,Addon_IGST,Addon_Inclusive,Delete,External_Addon_Id\n"b0909e52-a731-4665-a791-ee6479008805","11101","77","addon group name","7767","addon name 1","0","7","veg","1","0","0","0","1","","xyz"'
      );
    })
  );
  return mock_function;
}
export function mockItemAddonDataAddedItemAddonSuccess() {
  const mock_function = jest.spyOn(s3manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Restaurant_Id,Items_Id,AddonGroup_Id,AddonGroup_Name,Addon_Id,Addon_Name,Addon_Order,Addon_Price,Addon_IsVeg,Addon_Instock,Addon_SGST,Addon_CGST,Addon_IGST,Addon_Inclusive,Delete,External_Addon_Id\n"b0909e52-a731-4665-a791-ee6479008805","11103","77","addon group name",,"csv addon name","0","7","veg","1","0","0","0","1","","xyz"'
      );
    })
  );
  return mock_function;
}
