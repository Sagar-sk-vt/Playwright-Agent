# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\products.spec.ts >> FakeStore Products API Tests >> GET - Product by ID @master @sanity @api
- Location: tests\api\products.spec.ts:43:7

# Error details

```
Error: A valid product ID should return HTTP 200

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 521
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import dotenv from 'dotenv';
  3   | import { Routes } from '../../api/endpoints/routes';
  4   | import { RandomDataUtil } from '../../utils/dataGenerator';
  5   | 
  6   | dotenv.config();
  7   | 
  8   | interface Product {
  9   |   id: number;
  10  |   title: string;
  11  |   price: number;
  12  |   description: string;
  13  |   category: string;
  14  |   image: string;
  15  |   rating?: {
  16  |     rate: number;
  17  |     count: number;
  18  |   };
  19  | }
  20  | 
  21  | test.describe('FakeStore Products API Tests', () => {
  22  |   const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  23  |   const PRODUCT_ID = 1;
  24  |   const PRODUCT_LIMIT = 5;
  25  | 
  26  |   test('GET - All products @master @sanity @api', async ({ request }) => {
  27  |     const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
  28  |     expect(response.status(), 'The products endpoint should return HTTP 200').toBe(200);
  29  | 
  30  |     const products: Product[] = await response.json();
  31  |     expect(Array.isArray(products), 'The products response should be an array').toBe(true);
  32  |     expect(products.length, 'At least one product should be returned').toBeGreaterThan(0);
  33  | 
  34  |     for (const product of products) {
  35  |       expect(product.id, 'Each product should have a numeric ID').toEqual(expect.any(Number));
  36  |       expect(product.title, 'Each product should have a title').toEqual(expect.any(String));
  37  |       expect(product.price, 'Each product should have a numeric price').toEqual(expect.any(Number));
  38  |       expect(product.category, 'Each product should have a category').toEqual(expect.any(String));
  39  |       expect(product.image, 'Each product should have an image URL').toEqual(expect.any(String));
  40  |     }
  41  |   });
  42  | 
  43  |   test('GET - Product by ID @master @sanity @api', async ({ request }) => {
  44  |     const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID));
  45  |     const response = await request.get(`${BASE_URL}${route}`);
> 46  |     expect(response.status(), 'A valid product ID should return HTTP 200').toBe(200);
      |                                                                            ^ Error: A valid product ID should return HTTP 200
  47  | 
  48  |     const product: Product = await response.json();
  49  |     expect(product.id, 'The response should contain the requested product').toBe(PRODUCT_ID);
  50  |     expect(product.title).toEqual(expect.any(String));
  51  |     expect(product.price).toEqual(expect.any(Number));
  52  |     expect(product.category).toEqual(expect.any(String));
  53  |     expect(product.image).toEqual(expect.any(String));
  54  |   });
  55  | 
  56  |   test('GET - Products with limit @master @sanity @api', async ({ request }) => {
  57  |     const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(PRODUCT_LIMIT));
  58  |     const response = await request.get(`${BASE_URL}${route}`);
  59  |     expect(response.status(), 'The limited products endpoint should return HTTP 200').toBe(200);
  60  | 
  61  |     const products: Product[] = await response.json();
  62  |     expect(Array.isArray(products), 'The limited products response should be an array').toBe(true);
  63  |     expect(products, 'The result count should match the requested limit').toHaveLength(PRODUCT_LIMIT);
  64  |   });
  65  | 
  66  |   for (const order of ['asc', 'desc'] as const) {
  67  |     test(`GET - Products sorted ${order} @master @sanity @api`, async ({ request }) => {
  68  |       const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', order);
  69  |       const response = await request.get(`${BASE_URL}${route}`);
  70  |       expect(response.status(), `Sorting products ${order} should return HTTP 200`).toBe(200);
  71  | 
  72  |       const products: Product[] = await response.json();
  73  |       expect(products.length, 'At least one product should be available to sort').toBeGreaterThan(0);
  74  |       const ids = products.map((product) => product.id);
  75  |       const sortedIds = [...ids].sort((left, right) => (order === 'asc' ? left - right : right - left));
  76  |       expect(ids, `Product IDs should be ordered ${order}`).toEqual(sortedIds);
  77  |     });
  78  |   }
  79  | 
  80  |   test('GET - All product categories @master @sanity @api', async ({ request }) => {
  81  |     const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
  82  |     expect(response.status(), 'The product categories endpoint should return HTTP 200').toBe(200);
  83  | 
  84  |     const categories: string[] = await response.json();
  85  |     expect(Array.isArray(categories), 'The categories response should be an array').toBe(true);
  86  |     expect(categories.length, 'At least one product category should be returned').toBeGreaterThan(0);
  87  |     expect(categories.every((category) => typeof category === 'string')).toBe(true);
  88  |   });
  89  | 
  90  |   test('GET - Products by category @master @sanity @api', async ({ request }) => {
  91  |     const category = 'electronics';
  92  |     const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', encodeURIComponent(category));
  93  |     const response = await request.get(`${BASE_URL}${route}`);
  94  |     expect(response.status(), 'A valid product category should return HTTP 200').toBe(200);
  95  | 
  96  |     const products: Product[] = await response.json();
  97  |     expect(Array.isArray(products), 'The category products response should be an array').toBe(true);
  98  |     expect(products.length, 'The selected category should contain products').toBeGreaterThan(0);
  99  |     for (const product of products) {
  100 |       expect(product.category, 'Every returned product should match the requested category').toBe(category);
  101 |     }
  102 |   });
  103 | 
  104 |   test('POST - Create product @master @regression @api', async ({ request }) => {
  105 |     const payload = RandomDataUtil.generateProductPayload();
  106 |     const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: payload });
  107 |     expect(response.status(), 'Creating a product should return HTTP 201').toBe(201);
  108 | 
  109 |     const created: Product = await response.json();
  110 |     expect(created.id, 'The created product should have a numeric ID').toEqual(expect.any(Number));
  111 |     expect(created).toMatchObject(payload);
  112 | 
  113 |     const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(created.id));
  114 |     const cleanupResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
  115 |     expect(cleanupResponse.status(), 'The created product should be removed after verification').toBe(200);
  116 |   });
  117 | 
  118 |   test('PUT - Update product @master @regression @api', async ({ request }) => {
  119 |     const createdResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
  120 |       data: RandomDataUtil.generateProductPayload(),
  121 |     });
  122 |     expect(createdResponse.status(), 'A product is needed before it can be updated').toBe(201);
  123 |     const created: Product = await createdResponse.json();
  124 |     const payload = RandomDataUtil.generateUpdatedProductPayload();
  125 |     const route = Routes.UPDATE_PRODUCT.replace('{id}', String(created.id));
  126 | 
  127 |     const response = await request.put(`${BASE_URL}${route}`, { data: payload });
  128 |     expect(response.status(), 'Updating a product should return HTTP 200').toBe(200);
  129 | 
  130 |     const updated: Product = await response.json();
  131 |     expect(updated.id, 'The update should refer to the created product').toBe(created.id);
  132 |     expect(updated).toMatchObject(payload);
  133 | 
  134 |     const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(created.id));
  135 |     const cleanupResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
  136 |     expect(cleanupResponse.status(), 'The updated product should be removed after verification').toBe(200);
  137 |   });
  138 | 
  139 |   test('DELETE - Product @master @regression @api', async ({ request }) => {
  140 |     const createdResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
  141 |       data: RandomDataUtil.generateProductPayload(),
  142 |     });
  143 |     expect(createdResponse.status(), 'A product is needed before it can be deleted').toBe(201);
  144 |     const created: Product = await createdResponse.json();
  145 |     const route = Routes.DELETE_PRODUCT.replace('{id}', String(created.id));
  146 | 
```