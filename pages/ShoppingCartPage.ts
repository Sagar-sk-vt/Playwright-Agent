import { Locator, Page } from '@playwright/test';

export class ShoppingCartPage {
  private readonly page: Page;

  // Locators
  private readonly shoppingCartLink: Locator;
  private readonly shoppingCartHeading: Locator;
  private readonly productTable: Locator;
  private readonly totalsTable: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.shoppingCartLink = page.getByRole('link', { name: /Shopping Cart/ });
    this.shoppingCartHeading = page.getByRole('heading', { name: /Shopping Cart/ });
    this.productTable = page.locator('#content table').first();
    this.totalsTable = page.locator('#content table').nth(1);
  }

  /**
   * Opens the shopping cart page.
   * @returns Promise<void>
   */
  async openShoppingCart(): Promise<void> {
    try {
      await this.shoppingCartLink.click();
      await this.page.waitForURL(/route=checkout\/cart/);
      await this.shoppingCartHeading.waitFor({ state: 'visible' });
    } catch (error) {
      console.log(`Error opening the shopping cart: ${error}`);
      throw error;
    }
  }

  /**
   * Verifies that the shopping cart page is displayed.
   * @returns Promise<boolean> - true if the cart heading is visible
   */
  async isShoppingCartPageExists(): Promise<boolean> {
    try {
      return await this.shoppingCartHeading.isVisible();
    } catch (error) {
      console.log(`Error checking the shopping cart page: ${error}`);
      return false;
    }
  }

  /**
   * Verifies that a product is present in the cart.
   * @param productName - Product name to find in the cart
   * @returns Promise<boolean> - true if the product row is visible
   */
  async isProductInCart(productName: string): Promise<boolean> {
    try {
      return await this.getProductRow(productName).isVisible();
    } catch (error) {
      console.log(`Error checking for "${productName}" in the cart: ${error}`);
      return false;
    }
  }

  /**
   * Verifies that a selected option is shown for a product in the cart.
   * @param productName - Product name in the cart
   * @param optionName - Selected option name
   * @returns Promise<boolean> - true if the option is shown in the product row
   */
  async isProductOptionInCart(productName: string, optionName: string): Promise<boolean> {
    try {
      return (await this.getProductRow(productName).innerText()).includes(optionName);
    } catch (error) {
      console.log(`Error checking option "${optionName}" for "${productName}" in the cart: ${error}`);
      return false;
    }
  }

  /**
   * Gets the quantity for a product in the cart.
   * @param productName - Product name in the cart
   * @returns Promise<string> - Product quantity
   */
  async getProductQuantity(productName: string): Promise<string> {
    return await this.getProductRow(productName).getByRole('textbox').inputValue();
  }

  /**
   * Gets the unit price for a product in the cart.
   * @param productName - Product name in the cart
   * @returns Promise<string> - Product unit price
   */
  async getProductUnitPrice(productName: string): Promise<string> {
    return (await this.getProductRow(productName).getByRole('cell').nth(4).innerText()).trim();
  }

  /**
   * Gets the line total for a product in the cart.
   * @param productName - Product name in the cart
   * @returns Promise<string> - Product line total
   */
  async getProductLineTotal(productName: string): Promise<string> {
    return (await this.getProductRow(productName).getByRole('cell').nth(5).innerText()).trim();
  }

  /**
   * Gets the grand total shown in the cart summary.
   * @returns Promise<string> - Cart total
   */
  async getCartTotal(): Promise<string> {
    const totalRow = this.totalsTable.getByRole('row').filter({ hasText: 'Total:' });
    return (await totalRow.getByRole('cell').last().innerText()).trim();
  }

  private getProductRow(productName: string): Locator {
    return this.productTable.locator('tbody tr').filter({ hasText: productName });
  }
}
