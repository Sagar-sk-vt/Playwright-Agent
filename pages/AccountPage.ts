import { Locator, Page } from '@playwright/test';

export class AccountPage {
  private readonly page: Page;

  // Locators
  private readonly myAccountHeading: Locator;
  private readonly logoutLink: Locator;
  private readonly logoutHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.myAccountHeading = page.locator('#content').getByRole('heading', {
      name: 'My Account',
      exact: true,
    });
    this.logoutLink = page.getByRole('link', { name: 'Logout', exact: true });
    this.logoutHeading = page.getByRole('heading', { name: 'Account Logout', exact: true });
  }

  /**
   * Verifies that the authenticated account dashboard is displayed.
   * @returns Promise<boolean> - true if the customer is authenticated
   */
  async isMyAccountPageExists(): Promise<boolean> {
    try {
      return await this.myAccountHeading.isVisible();
    } catch (error) {
      console.log(`Error checking the customer account page: ${error}`);
      return false;
    }
  }

  /**
   * Logs out the current customer.
   * @returns Promise<void>
   */
  async clickLogout(): Promise<void> {
    try {
      await this.logoutLink.click();
      await this.logoutHeading.waitFor({ state: 'visible' });
    } catch (error) {
      console.log(`Error logging out the customer: ${error}`);
      throw error;
    }
  }

  /**
   * Verifies that the logout confirmation page is displayed.
   * @returns Promise<boolean> - true if logout succeeded
   */
  async isLogoutPageExists(): Promise<boolean> {
    try {
      return await this.logoutHeading.isVisible();
    } catch (error) {
      console.log(`Error checking the logout confirmation: ${error}`);
      return false;
    }
  }
}
