import { Locator, Page } from '@playwright/test';

export class ProductPage {
  private readonly page: Page;

  // Locators
  private readonly productHeading: Locator;
  private readonly productPrice: Locator;
  private readonly productAvailability: Locator;
  private readonly sizeOption: Locator;
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;
  private readonly addToCartMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.productHeading = page.locator('#content').getByRole('heading', { level: 1 });
    this.productPrice = page.locator('#content').getByRole('heading', { level: 2 });
    this.productAvailability = page.locator('#content').getByText('Availability:In Stock', { exact: true });
    this.sizeOption = page.locator('#content').getByRole('combobox');
    this.quantityInput = page.getByRole('textbox', { name: 'Qty' });
    this.addToCartButton = page.getByRole('button', { name: 'Add to Cart', exact: true });
    this.addToCartMessage = page.getByText('Success: You have added', { exact: false });
  }

  /**
   * Verifies that the requested product details are displayed.
   * @param productName - Expected product name
   * @returns Promise<boolean> - true if the product heading matches
   */
  async isProductDetailsPageExists(productName: string): Promise<boolean> {
    try {
      return (await this.productHeading.textContent())?.trim() === productName;
    } catch (error) {
      console.log(`Error checking product details for "${productName}": ${error}`);
      return false;
    }
  }

  /**
   * Gets the displayed product price.
   * @returns Promise<string> - Product price text
   */
  async getProductPrice(): Promise<string> {
    return (await this.productPrice.textContent())?.trim() ?? '';
  }

  /**
   * Verifies that the product is available in stock.
   * @returns Promise<boolean> - true if the product is in stock
   */
  async isProductInStock(): Promise<boolean> {
    try {
      return await this.productAvailability.isVisible();
    } catch (error) {
      console.log(`Error checking product availability: ${error}`);
      return false;
    }
  }

  /**
   * Selects the requested product size option.
   * @param optionName - Visible name of the size option
   * @returns Promise<void>
   */
  async selectSizeOption(optionName: string): Promise<void> {
    try {
      const optionValue = await this.sizeOption.locator('option').filter({ hasText: optionName }).getAttribute('value');
      if (!optionValue) {
        throw new Error(`Size option "${optionName}" was not found.`);
      }
      await this.sizeOption.selectOption(optionValue);
    } catch (error) {
      console.log(`Error selecting product size option "${optionName}": ${error}`);
      throw error;
    }
  }

  /**
   * Adds the product to the cart with the requested quantity.
   * @param quantity - Number of items to add
   * @returns Promise<void>
   */
  async addToCart(quantity: string): Promise<void> {
    try {
      await this.quantityInput.fill(quantity);
      await this.addToCartButton.click();
      await this.addToCartMessage.waitFor({ state: 'visible' });
    } catch (error) {
      console.log(`Error adding product to cart: ${error}`);
      throw error;
    }
  }

  /**
   * Verifies that the add-to-cart confirmation is displayed.
   * @returns Promise<boolean> - true if the product was added
   */
  async isAddToCartMessageVisible(): Promise<boolean> {
    try {
      return await this.addToCartMessage.isVisible();
    } catch (error) {
      console.log(`Error checking the add-to-cart confirmation: ${error}`);
      return false;
    }
  }
}
