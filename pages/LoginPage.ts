import { Locator, Page } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;

  // Locators
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.emailInput = page.getByRole('textbox', { name: 'E-Mail Address' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
  }

  /**
   * Authenticates a customer using their email and password.
   * @param email - Registered customer email
   * @param password - Registered customer password
   * @returns Promise<void>
   */
  async login(email: string, password: string): Promise<void> {
    try {
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
      await this.page.waitForURL(/route=account\/account/);
    } catch (error) {
      console.log(`Error logging in the customer: ${error}`);
      throw error;
    }
  }
}
