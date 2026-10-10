import { Locator, Page } from '@playwright/test';

export class SearchResultsPage {
  private readonly page: Page;

  // Locators
  private readonly resultsHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.resultsHeading = page.locator('#content').getByRole('heading', { level: 1 });
  }

  /**
   * Verifies that the exact product appears in search results.
   * @param productName - Product name to find
   * @returns Promise<boolean> - true if the product link is visible
   */
  async isProductListed(productName: string): Promise<boolean> {
    try {
      return await this.page.getByRole('link', { name: productName, exact: true }).first().isVisible();
    } catch (error) {
      console.log(`Error checking search results for "${productName}": ${error}`);
      return false;
    }
  }

  /**
   * Opens a product from the search results.
   * @param productName - Exact product name to open
   * @returns Promise<void>
   */
  async openProduct(productName: string): Promise<void> {
    try {
      await this.page.getByRole('link', { name: productName, exact: true }).first().click();
      await this.page.waitForURL(/route=product\/product/);
      await this.resultsHeading.waitFor({ state: 'visible' });
    } catch (error) {
      console.log(`Error opening product "${productName}": ${error}`);
      throw error;
    }
  }
}
