import { Locator, Page } from '@playwright/test';

export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly accountMenuLink: Locator;
  private readonly registerMenuLink: Locator;
  private readonly loginMenuLink: Locator;
  private readonly searchInput: Locator;
  private readonly featuredHeading: Locator;
  private readonly desktopsLink: Locator;
  private readonly showAllDesktopsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.accountMenuLink = page.getByRole('link', { name: /My Account/ }).first();
    this.registerMenuLink = page.getByRole('link', { name: 'Register', exact: true }).first();
    this.loginMenuLink = page.getByRole('link', { name: 'Login', exact: true }).first();
    this.searchInput = page.getByRole('textbox', { name: 'Search', exact: true });
    this.featuredHeading = page.getByRole('heading', { name: 'Featured', exact: true });
    this.desktopsLink = page.getByRole('link', { name: 'Desktops', exact: true }).first();
    this.showAllDesktopsLink = page.getByRole('link', { name: /Show All\s*Desktops/ });
  }

  /**
   * Verifies that the store home page is displayed.
   * @returns Promise<boolean> - true if the featured products are displayed
   */
  async isHomePageExists(): Promise<boolean> {
    try {
      return await this.featuredHeading.isVisible();
    } catch (error) {
      console.log(`Error checking the home page: ${error}`);
      return false;
    }
  }

  /**
   * Opens the customer registration page from the My Account menu.
   * @returns Promise<void>
   */
  async openRegister(): Promise<void> {
    try {
      await this.accountMenuLink.click();
      await this.registerMenuLink.click();
      await this.page.waitForURL(/route=account\/register/);
    } catch (error) {
      console.log(`Error opening the registration page: ${error}`);
      throw error;
    }
  }

  /**
   * Opens the customer login page from the My Account menu.
   * @returns Promise<void>
   */
  async openLogin(): Promise<void> {
    try {
      await this.accountMenuLink.click();
      await this.loginMenuLink.click();
      await this.page.waitForURL(/route=account\/login/);
    } catch (error) {
      console.log(`Error opening the login page: ${error}`);
      throw error;
    }
  }

  /**
   * Searches the store for a product.
   * @param productName - Product name to search for
   * @returns Promise<void>
   */
  async searchProduct(productName: string): Promise<void> {
    try {
      await this.searchInput.fill(productName);
      await this.searchInput.press('Enter');
      await this.page.waitForURL(/route=product\/search/);
    } catch (error) {
      console.log(`Error searching for product "${productName}": ${error}`);
      throw error;
    }
  }

  /**
   * Opens the Shop All Desktops category.
   * @returns Promise<void>
   */
  async openDesktopsCategory(): Promise<void> {
    try {
      await this.desktopsLink.click();
      await this.showAllDesktopsLink.click();
      await this.page.waitForURL(/route=product\/category&path=20/);
    } catch (error) {
      console.log(`Error opening the Desktops category: ${error}`);
      throw error;
    }
  }
}
