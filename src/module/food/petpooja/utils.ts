import {getBackwardPercentAmount, roundUp} from '../../../utilities/utilFuncs';
import {IPetPoojaAttribute, IPetPoojaTax} from './types';

export function stringToBoolean(status: '1' | '0'): boolean {
  if (status === '1') {
    return true;
  } else {
    return false;
  }
}

export function getItemAttribute(
  attribute_id: string,
  petpooja_attributes: IPetPoojaAttribute[]
): string {
  const matched_attribute = petpooja_attributes.find(
    attribute => attribute.attributeid === attribute_id
  );

  if (
    matched_attribute &&
    ['veg', 'non-veg', 'egg'].includes(matched_attribute.attribute)
  ) {
    return matched_attribute.attribute;
  } else {
    return 'non-veg';
  }
}

export function filterInsertUpdateAndDeleteEntities(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatted_entities: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  database_entities: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  common_key = 'pos_id'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): {insert_entities: any[]; update_entities: any[]; delete_entities: any[]} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insert_entities: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update_entities: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delete_entities: any[] = [];

  for (let i = 0; i < formatted_entities.length; i++) {
    const database_element = database_entities.find(
      element => element[common_key] === formatted_entities[i][common_key]
    );
    if (database_element) {
      formatted_entities[i].id = database_element.id;
      update_entities.push(formatted_entities[i]);
    } else {
      insert_entities.push(formatted_entities[i]);
    }
  }

  database_entities.forEach(database_element => {
    if (
      !update_entities.find(
        update_element =>
          update_element[common_key] === database_element[common_key]
      )
    ) {
      delete_entities.push(database_element);
    }
  });
  return {insert_entities, update_entities, delete_entities};
}

export function getPetPoojaPaymentType(type?: string) {
  if (type) {
    if (['COD', 'CARD', 'CREDIT', 'ONLINE'].includes(type.toUpperCase())) {
      return type.toUpperCase();
    } else {
      return 'OTHER';
    }
  } else {
    return 'OTHER';
  }
}

export function calculatePetpoojaMenuEntityTaxes(
  petpooja_entity_tax_ids: string[],
  petpooja_taxes: IPetPoojaTax[],
  petpooja_entity_price?: number
): {
  cgst_tax: number;
  sgst_tax: number;
  convert_to_forward_tax: boolean;
  entity_price?: number;
} {
  let cgst_tax = 0;
  let sgst_tax = 0;
  let convert_to_forward_tax = false;

  petpooja_entity_tax_ids.forEach(tax_id => {
    const tax = petpooja_taxes.find(tax => tax.taxid === tax_id);
    if (tax) {
      if (tax.taxname === 'CGST' && !isNaN(+tax.tax)) {
        cgst_tax = +tax.tax;
        if (tax.tax_taxtype === '2') {
          convert_to_forward_tax = true;
        }
      } else if (tax.taxname === 'SGST' && !isNaN(+tax.tax)) {
        sgst_tax = +tax.tax;
        if (tax.tax_taxtype === '2') {
          convert_to_forward_tax = true;
        }
      }
    }
  });
  const result: {
    cgst_tax: number;
    sgst_tax: number;
    entity_price?: number;
    convert_to_forward_tax: boolean;
  } = {cgst_tax, sgst_tax, convert_to_forward_tax};

  if (convert_to_forward_tax && petpooja_entity_price) {
    result.entity_price = roundUp(
      getBackwardPercentAmount(petpooja_entity_price, cgst_tax + sgst_tax),
      2
    );
  }

  return result;
}
