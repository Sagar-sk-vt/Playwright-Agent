import { Locator, Page } from '@playwright/test';

export interface CustomerRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
}

export class RegisterPage {
  private readonly page: Page;

  // Locators
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly telephoneInput: Locator;
  private readonly passwordInput: Locator;
  private readonly passwordConfirmInput: Locator;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly continueButton: Locator;
  private readonly registrationSuccessHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.emailInput = page.getByPlaceholder('E-Mail');
    this.telephoneInput = page.getByPlaceholder('Telephone');
    this.passwordInput = page.getByPlaceholder('Password', { exact: true });
    this.passwordConfirmInput = page.getByPlaceholder('Password Confirm');
    this.privacyPolicyCheckbox = page.getByRole('checkbox');
    this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    this.registrationSuccessHeading = page.getByRole('heading', {
      name: 'Your Account Has Been Created!',
      exact: true,
    });
  }

  /**
   * Registers a new customer with the supplied account details.
   * @param customer - Customer details for registration
   * @returns Promise<void>
   */
  async register(customer: CustomerRegistrationData): Promise<void> {
    try {
      await this.firstNameInput.fill(customer.firstName);
      await this.lastNameInput.fill(customer.lastName);
      await this.emailInput.fill(customer.email);
      await this.telephoneInput.fill(customer.telephone);
      await this.passwordInput.fill(customer.password);
      await this.passwordConfirmInput.fill(customer.password);
      await this.privacyPolicyCheckbox.check();
      await this.continueButton.click();
      await this.page.waitForURL(/route=account\/success/);
    } catch (error) {
      console.log(`Error registering customer: ${error}`);
      throw error;
    }
  }

  /**
   * Verifies that the registration confirmation page is displayed.
   * @returns Promise<boolean> - true if registration succeeded
   */
  async isRegistrationSuccessPageExists(): Promise<boolean> {
    try {
      return await this.registrationSuccessHeading.isVisible();
    } catch (error) {
      console.log(`Error checking the registration confirmation: ${error}`);
      return false;
    }
  }
}
