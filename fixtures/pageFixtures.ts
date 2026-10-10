import { test as base, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { AccountPage } from '../pages/AccountPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { RegisterPage } from '../pages/RegisterPage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { ShoppingCartPage } from '../pages/ShoppingCartPage';

dotenv.config();

const APP_URL = process.env.WEB_APP_URL;

type PageFixtures = {
  accountPage: AccountPage;
  homePage: HomePage;
  loginPage: LoginPage;
  productPage: ProductPage;
  registerPage: RegisterPage;
  searchResultsPage: SearchResultsPage;
  shoppingCartPage: ShoppingCartPage;
};

export const test = base.extend<PageFixtures>({
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  homePage: async ({ page }, use) => {
    if (!APP_URL) {
      throw new Error('WEB_APP_URL must be set in the environment.');
    }

    await page.goto(APP_URL);
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  shoppingCartPage: async ({ page }, use) => {
    await use(new ShoppingCartPage(page));
  },
});

test.afterEach(async ({ page, context }) => {
  if (!page.isClosed()) {
    await page.close();
  }
  await context.close();
});

export { expect } from '@playwright/test';
