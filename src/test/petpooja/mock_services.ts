import * as petpooja_module from '../../module/food/petpooja/external_call';

export function mockSuccessfullOrderPlacedAtPetpooja(
  restaurant_id: string,
  order_id: string
) {
  const mock_function = jest.spyOn(petpooja_module, 'saveOrderAtPetPooja');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        success: '1',
        message: 'Your order is saved.',
        restID: restaurant_id,
        clientOrderID: order_id,
        orderID: '1000',
      });
    })
  );
}
