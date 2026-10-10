import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: {
    rate: number;
    count: number;
  };
}

test.describe('FakeStore Products API Tests', () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const PRODUCT_ID = 1;
  const PRODUCT_LIMIT = 5;

  test('GET - All products @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status(), 'The products endpoint should return HTTP 200').toBe(200);

    const products: Product[] = await response.json();
    expect(Array.isArray(products), 'The products response should be an array').toBe(true);
    expect(products.length, 'At least one product should be returned').toBeGreaterThan(0);

    for (const product of products) {
      expect(product.id, 'Each product should have a numeric ID').toEqual(expect.any(Number));
      expect(product.title, 'Each product should have a title').toEqual(expect.any(String));
      expect(product.price, 'Each product should have a numeric price').toEqual(expect.any(Number));
      expect(product.category, 'Each product should have a category').toEqual(expect.any(String));
      expect(product.image, 'Each product should have an image URL').toEqual(expect.any(String));
    }
  });

  test('GET - Product by ID @master @sanity @api', async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'A valid product ID should return HTTP 200').toBe(200);

    const product: Product = await response.json();
    expect(product.id, 'The response should contain the requested product').toBe(PRODUCT_ID);
    expect(product.title).toEqual(expect.any(String));
    expect(product.price).toEqual(expect.any(Number));
    expect(product.category).toEqual(expect.any(String));
    expect(product.image).toEqual(expect.any(String));
  });

  test('GET - Products with limit @master @sanity @api', async ({ request }) => {
    const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(PRODUCT_LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'The limited products endpoint should return HTTP 200').toBe(200);

    const products: Product[] = await response.json();
    expect(Array.isArray(products), 'The limited products response should be an array').toBe(true);
    expect(products, 'The result count should match the requested limit').toHaveLength(PRODUCT_LIMIT);
  });

  for (const order of ['asc', 'desc'] as const) {
    test(`GET - Products sorted ${order} @master @sanity @api`, async ({ request }) => {
      const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', order);
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), `Sorting products ${order} should return HTTP 200`).toBe(200);

      const products: Product[] = await response.json();
      expect(products.length, 'At least one product should be available to sort').toBeGreaterThan(0);
      const ids = products.map((product) => product.id);
      const sortedIds = [...ids].sort((left, right) => (order === 'asc' ? left - right : right - left));
      expect(ids, `Product IDs should be ordered ${order}`).toEqual(sortedIds);
    });
  }

  test('GET - All product categories @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
    expect(response.status(), 'The product categories endpoint should return HTTP 200').toBe(200);

    const categories: string[] = await response.json();
    expect(Array.isArray(categories), 'The categories response should be an array').toBe(true);
    expect(categories.length, 'At least one product category should be returned').toBeGreaterThan(0);
    expect(categories.every((category) => typeof category === 'string')).toBe(true);
  });

  test('GET - Products by category @master @sanity @api', async ({ request }) => {
    const category = 'electronics';
    const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', encodeURIComponent(category));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'A valid product category should return HTTP 200').toBe(200);

    const products: Product[] = await response.json();
    expect(Array.isArray(products), 'The category products response should be an array').toBe(true);
    expect(products.length, 'The selected category should contain products').toBeGreaterThan(0);
    for (const product of products) {
      expect(product.category, 'Every returned product should match the requested category').toBe(category);
    }
  });

  test('POST - Create product @master @regression @api', async ({ request }) => {
    const payload = RandomDataUtil.generateProductPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: payload });
    expect(response.status(), 'Creating a product should return HTTP 201').toBe(201);

    const created: Product = await response.json();
    expect(created.id, 'The created product should have a numeric ID').toEqual(expect.any(Number));
    expect(created).toMatchObject(payload);

    const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(created.id));
    const cleanupResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(cleanupResponse.status(), 'The created product should be removed after verification').toBe(200);
  });

  test('PUT - Update product @master @regression @api', async ({ request }) => {
    const createdResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
      data: RandomDataUtil.generateProductPayload(),
    });
    expect(createdResponse.status(), 'A product is needed before it can be updated').toBe(201);
    const created: Product = await createdResponse.json();
    const payload = RandomDataUtil.generateUpdatedProductPayload();
    const route = Routes.UPDATE_PRODUCT.replace('{id}', String(created.id));

    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), 'Updating a product should return HTTP 200').toBe(200);

    const updated: Product = await response.json();
    expect(updated.id, 'The update should refer to the created product').toBe(created.id);
    expect(updated).toMatchObject(payload);

    const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(created.id));
    const cleanupResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(cleanupResponse.status(), 'The updated product should be removed after verification').toBe(200);
  });

  test('DELETE - Product @master @regression @api', async ({ request }) => {
    const createdResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
      data: RandomDataUtil.generateProductPayload(),
    });
    expect(createdResponse.status(), 'A product is needed before it can be deleted').toBe(201);
    const created: Product = await createdResponse.json();
    const route = Routes.DELETE_PRODUCT.replace('{id}', String(created.id));

    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), 'Deleting a product should return HTTP 200').toBe(200);
    const deleted: Product = await response.json();
    expect(deleted.id, 'The delete response should identify the deleted product').toBe(created.id);
  });
});
