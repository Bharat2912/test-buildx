import * as s3_manager from '../../utilities/s3_manager';

export function mockGenerateDownloadFileURL() {
  const mock_function = jest.spyOn(s3_manager, 'generateDownloadFileURL');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve({
        name: 'name',
        url: 'url',
      });
    })
  );
  return mock_function;
}

export function mockFilterOrderValidCsv() {
  const mock_function = jest.spyOn(s3_manager, 'getTempFileData');
  mock_function.mockReturnValue(
    new Promise(resolve => {
      resolve(
        'Order Id,Restaurant Id,Order Delivery At,Customer Address,Payment Details,Delivery Details,Menu Item Name,Quantity,Variants Name,Variants Cost,Addon Group Name,Addon Name,Addon Price,Addon Group Tax Amount,Total Item Cost,Packing Charges,Delivery Charges,Total Tax,Transaction Charges,Coupon Code,Offer Discount,Vendor Payou Amount,Total Customer paid,Order placed At,Vendor Accepted Time,Order Accpeted End Time,Marked Ready At,Picked Up At,Delivered At,Vendor Order Status,Delivery Status,Order Status,Refund Status\n1000,b0909e52-a731-4665-a791-ee6479008805,Burger King,completed,Mohit Gupta,Ankita Thakkar,ankita.t@speedyy.com,+918758668003,Mumbai,Maharashtra,India,mumbai,102,RES_99c6fdbc-8df6-4541-9d3f-f9e5ba4c0242,PPI,completed,WALLET,20220518111212800110168531851371782,2022-05-12T19:57:22.518718+05:30,,Amit Kumar,9898989898,,'
      );
    })
  );
  return mock_function;
}
