# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\endToEndShoppingFlow.spec.ts >> End-to-End Shopping Flow @master @sanity @regression @end-to-end @web
- Location: tests\web\endToEndShoppingFlow.spec.ts:29:5

# Error details

```
Error: locator.waitFor: Error: strict mode violation: getByRole('heading', { level: 1 }) resolved to 2 elements:
    1) <h1>…</h1> aka getByRole('heading', { name: 'Qafox.com' })
    2) <h1>MacBook</h1> aka getByRole('heading', { name: 'MacBook' })

Call log:
  - waiting for getByRole('heading', { level: 1 }) to be visible

```

# Test source

```ts
  1  | import { Locator, Page } from '@playwright/test';
  2  | 
  3  | export class SearchResultsPage {
  4  |   private readonly page: Page;
  5  | 
  6  |   // Locators
  7  |   private readonly resultsHeading: Locator;
  8  | 
  9  |   constructor(page: Page) {
  10 |     this.page = page;
  11 | 
  12 |     // Initialize locators with CSS selectors
  13 |     this.resultsHeading = page.getByRole('heading', { level: 1 });
  14 |   }
  15 | 
  16 |   /**
  17 |    * Verifies that the exact product appears in search results.
  18 |    * @param productName - Product name to find
  19 |    * @returns Promise<boolean> - true if the product link is visible
  20 |    */
  21 |   async isProductListed(productName: string): Promise<boolean> {
  22 |     try {
  23 |       return await this.page.getByRole('link', { name: productName, exact: true }).first().isVisible();
  24 |     } catch (error) {
  25 |       console.log(`Error checking search results for "${productName}": ${error}`);
  26 |       return false;
  27 |     }
  28 |   }
  29 | 
  30 |   /**
  31 |    * Opens a product from the search results.
  32 |    * @param productName - Exact product name to open
  33 |    * @returns Promise<void>
  34 |    */
  35 |   async openProduct(productName: string): Promise<void> {
  36 |     try {
  37 |       await this.page.getByRole('link', { name: productName, exact: true }).first().click();
  38 |       await this.page.waitForURL(/route=product\/product/);
> 39 |       await this.resultsHeading.waitFor({ state: 'visible' });
     |                                 ^ Error: locator.waitFor: Error: strict mode violation: getByRole('heading', { level: 1 }) resolved to 2 elements:
  40 |     } catch (error) {
  41 |       console.log(`Error opening product "${productName}": ${error}`);
  42 |       throw error;
  43 |     }
  44 |   }
  45 | }
  46 | 
```