import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

interface Cart {
  id: number;
  userId: number;
  date: string;
  products: Array<{
    productId: number;
    quantity: number;
  }>;
}

test.describe('FakeStore Carts API Tests', () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const CART_ID = 1;
  const USER_ID = 1;
  const CART_LIMIT = 3;

  test('GET - All carts @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(response.status(), 'The carts endpoint should return HTTP 200').toBe(200);

    const carts: Cart[] = await response.json();
    expect(Array.isArray(carts), 'The carts response should be an array').toBe(true);
    expect(carts.length, 'At least one cart should be returned').toBeGreaterThan(0);
    for (const cart of carts) {
      expect(cart.id, 'Each cart should have a numeric ID').toEqual(expect.any(Number));
      expect(cart.userId, 'Each cart should identify its user').toEqual(expect.any(Number));
      expect(Array.isArray(cart.products), 'Each cart should contain a products array').toBe(true);
    }
  });

  test('GET - Cart by ID @master @sanity @api', async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'A valid cart ID should return HTTP 200').toBe(200);

    const cart: Cart = await response.json();
    expect(cart.id, 'The response should contain the requested cart').toBe(CART_ID);
    expect(cart.products.length, 'The cart should contain product records').toBeGreaterThan(0);
  });

  test('GET - Carts in date range @master @sanity @api', async ({ request }) => {
    const startDate = '2019-12-01';
    const endDate = '2020-12-31';
    const route = Routes.GET_CARTS_BY_DATE_RANGE
      .replace('{startdate}', startDate)
      .replace('{enddate}', endDate);
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'The cart date-range endpoint should return HTTP 200').toBe(200);

    const carts: Cart[] = await response.json();
    expect(Array.isArray(carts), 'The date-range response should be an array').toBe(true);
    const startTime = Date.parse(`${startDate}T00:00:00.000Z`);
    const endTime = Date.parse(`${endDate}T23:59:59.999Z`);
    for (const cart of carts) {
      const cartTime = Date.parse(cart.date);
      expect(Number.isNaN(cartTime), 'Each cart date should be a valid date').toBe(false);
      expect(cartTime, 'A returned cart should not predate the requested range').toBeGreaterThanOrEqual(startTime);
      expect(cartTime, 'A returned cart should not postdate the requested range').toBeLessThanOrEqual(endTime);
    }
  });

  test('GET - Carts for a user @master @sanity @api', async ({ request }) => {
    const route = Routes.GET_USER_CART.replace('{userId}', String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'The user carts endpoint should return HTTP 200').toBe(200);

    const carts: Cart[] = await response.json();
    expect(Array.isArray(carts), 'The user carts response should be an array').toBe(true);
    for (const cart of carts) {
      expect(cart.userId, 'Every returned cart should belong to the requested user').toBe(USER_ID);
    }
  });

  test('GET - Carts with limit @master @sanity @api', async ({ request }) => {
    const route = Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(CART_LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'The limited carts endpoint should return HTTP 200').toBe(200);

    const carts: Cart[] = await response.json();
    expect(Array.isArray(carts), 'The limited carts response should be an array').toBe(true);
    expect(carts, 'The result count should match the requested limit').toHaveLength(CART_LIMIT);
  });

  for (const order of ['asc', 'desc'] as const) {
    test(`GET - Carts sorted ${order} @master @sanity @api`, async ({ request }) => {
      const route = Routes.GET_CARTS_SORTED.replace('{order}', order);
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), `Sorting carts ${order} should return HTTP 200`).toBe(200);

      const carts: Cart[] = await response.json();
      expect(carts.length, 'At least one cart should be available to sort').toBeGreaterThan(0);
      const ids = carts.map((cart) => cart.id);
      const sortedIds = [...ids].sort((left, right) => (order === 'asc' ? left - right : right - left));
      expect(ids, `Cart IDs should be ordered ${order}`).toEqual(sortedIds);
    });
  }

  test('POST - Create cart @master @regression @api', async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: payload });
    expect(response.status(), 'Creating a cart should return HTTP 201').toBe(201);

    const created: Cart = await response.json();
    expect(created.id, 'The created cart should have a numeric ID').toEqual(expect.any(Number));
    expect(created.userId).toBe(payload.userId);
    expect(created.products).toEqual(payload.products);

    const deleteRoute = Routes.DELETE_CART.replace('{id}', String(created.id));
    const cleanupResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(cleanupResponse.status(), 'The created cart should be removed after verification').toBe(200);
  });

  test('PUT - Update cart @master @regression @api', async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    const createdResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: payload });
    expect(createdResponse.status(), 'A cart is needed before it can be updated').toBe(201);
    const created: Cart = await createdResponse.json();
    const updatedPayload = {
      ...RandomDataUtil.generateUpdatedCartPayload(USER_ID),
      products: [{ productId: payload.products[0].productId, quantity: payload.products[0].quantity + 1 }],
    };
    const route = Routes.UPDATE_CART.replace('{id}', String(created.id));

    const response = await request.put(`${BASE_URL}${route}`, { data: updatedPayload });
    expect(response.status(), 'Updating a cart should return HTTP 200').toBe(200);

    const updated: Cart = await response.json();
    expect(updated.id, 'The update should refer to the created cart').toBe(created.id);
    expect(updated.userId).toBe(updatedPayload.userId);
    expect(updated.products, 'The response should contain the requested product quantity').toEqual(
      updatedPayload.products,
    );

    const deleteRoute = Routes.DELETE_CART.replace('{id}', String(created.id));
    const cleanupResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(cleanupResponse.status(), 'The updated cart should be removed after verification').toBe(200);
  });

  test('DELETE - Cart @master @regression @api', async ({ request }) => {
    const createdResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
      data: RandomDataUtil.generateCartPayload(USER_ID),
    });
    expect(createdResponse.status(), 'A cart is needed before it can be deleted').toBe(201);
    const created: Cart = await createdResponse.json();
    const route = Routes.DELETE_CART.replace('{id}', String(created.id));

    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), 'Deleting a cart should return HTTP 200').toBe(200);
    const deleted: Cart = await response.json();
    expect(deleted.id, 'The delete response should identify the deleted cart').toBe(created.id);
  });
});
