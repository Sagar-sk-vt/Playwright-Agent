/**
 * Test Case: Complete customer registration, authentication, and shopping journey
 *
 * Tags: @master @sanity @regression @e2e @web
 *
 * Steps:
 * 1) Open the application
 * 2) Register a new customer using unique generated data
 * 3) Verify successful registration
 * 4) Log out
 * 5) Log in with the new credentials
 * 6) Verify successful authentication
 * 7) Open Shop All Desktops
 * 8) Find the in-stock Product 8
 * 9) Open the product details
 * 10) Select the Large size option
 * 11) Add the product to the cart
 * 12) Open the shopping cart
 * 13) Verify the product and selected size
 * 14) Verify the quantity
 * 15) Verify the product price and cart total
 * 16) Verify the journey completed successfully
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';
import { CustomerRegistrationData } from '../../pages/RegisterPage';

test('End-to-End Shopping Flow @master @sanity @regression @e2e @web', async ({
  accountPage,
  homePage,
  loginPage,
  productPage,
  registerPage,
  searchResultsPage,
  shoppingCartPage,
}) => {
  const customer: CustomerRegistrationData = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: RandomDataUtil.getEmail().replace('@', `.${Date.now()}@`),
    telephone: RandomDataUtil.getPhoneNumber(),
    password: RandomDataUtil.getPassword(),
  };
  const { productName, productQuantity, totalPrice } = Helper.getProductDetails();

  await test.step('1) Open the application', async () => {
    expect(await homePage.isHomePageExists()).toBeTruthy();
  });

  await test.step('2) Register a new customer with unique generated data', async () => {
    await homePage.openRegister();
    await registerPage.register(customer);
  });

  await test.step('3) Verify successful registration', async () => {
    expect(await registerPage.isRegistrationSuccessPageExists()).toBeTruthy();
  });

  await test.step('4) Log out of the newly created account', async () => {
    await accountPage.clickLogout();
    expect(await accountPage.isLogoutPageExists()).toBeTruthy();
  });

  await test.step('5) Log in again with the new customer credentials', async () => {
    await homePage.openLogin();
    await loginPage.login(customer.email, customer.password);
  });

  await test.step('6) Verify successful authentication', async () => {
    expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
  });

  await test.step('7) Open Shop All Desktops', async () => {
    await homePage.openDesktopsCategory();
  });

  await test.step('8) Find the in-stock Product 8', async () => {
    expect(await searchResultsPage.isProductListed(productName)).toBeTruthy();
  });

  await test.step('9) Open the product details page', async () => {
    await searchResultsPage.openProduct(productName);
    expect(await productPage.isProductDetailsPageExists(productName)).toBeTruthy();
    expect(await productPage.isProductInStock()).toBeTruthy();
  });

  await test.step('10) Select the Large size option', async () => {
    await productPage.selectSizeOption('Large');
  });

  await test.step('11) Add Product 8 to the cart', async () => {
    await productPage.addToCart(productQuantity);
    expect(await productPage.isAddToCartMessageVisible()).toBeTruthy();
  });

  await test.step('12) Open the shopping cart', async () => {
    await shoppingCartPage.openShoppingCart();
    expect(await shoppingCartPage.isShoppingCartPageExists()).toBeTruthy();
  });

  await test.step('13) Verify Product 8 and the selected Large size are in the cart', async () => {
    expect(await shoppingCartPage.isProductInCart(productName)).toBeTruthy();
    expect(await shoppingCartPage.isProductOptionInCart(productName, 'Large')).toBeTruthy();
  });

  await test.step('14) Verify the product quantity', async () => {
    expect(await shoppingCartPage.getProductQuantity(productName)).toBe(productQuantity);
  });

  await test.step('15) Verify the product price and applicable cart total', async () => {
    expect(await shoppingCartPage.getProductUnitPrice(productName)).toBe(totalPrice);
    expect(await shoppingCartPage.getProductLineTotal(productName)).toBe(totalPrice);
    expect(await shoppingCartPage.getCartTotal()).toBe(totalPrice);
  });

  await test.step('16) Verify the complete journey finished without test errors', async () => {
    expect(await shoppingCartPage.isShoppingCartPageExists()).toBeTruthy();
  });

  console.log('✅ Completed the end-to-end customer shopping journey successfully!');
});
