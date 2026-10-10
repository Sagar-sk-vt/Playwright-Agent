export class Helper {
  static convertPriceToNumber(price: string): number {
    return Number(price.replace(/[^0-9.]/g, ''));
  }

  static getProductDetails() {
    return {
      productName: 'Product 8',
      productQuantity: '1',
      totalPrice: '$140.00',
    };
  }

  static getLoginDetails() {
    return {
      email: 'pavanol@xyz.com',
      password: 'test@123',
    };
  }
}
