import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

test.describe('FakeStore API CRUD Workflows', () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const USER_ID = 1;

  test('POST, PUT, DELETE - Product CRUD workflow @master @regression @api', async ({ request }) => {
    const createPayload = RandomDataUtil.generateProductPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
      data: createPayload,
    });
    expect(createResponse.status(), 'The product workflow should create a product').toBe(201);

    const created = await createResponse.json();
    expect(created.id, 'The create response should return a product ID').toEqual(expect.any(Number));
    expect(created).toMatchObject(createPayload);

    const updatePayload = RandomDataUtil.generateUpdatedProductPayload();
    const updateRoute = Routes.UPDATE_PRODUCT.replace('{id}', String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status(), 'The product workflow should update the created product').toBe(200);

    const updated = await updateResponse.json();
    expect(updated.id, 'The update response should use the created product ID').toBe(created.id);
    expect(updated).toMatchObject(updatePayload);

    const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), 'The product workflow should delete the created product').toBe(200);
  });

  test('POST, PUT, DELETE - User CRUD workflow @master @regression @api', async ({ request }) => {
    const createPayload = RandomDataUtil.generateUserPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
      data: createPayload,
    });
    expect(createResponse.status(), 'The user workflow should create a user').toBe(201);

    const created = await createResponse.json();
    expect(created.id, 'The create response should return a user ID').toEqual(expect.any(Number));
    expect(created).toMatchObject(createPayload);

    const updatePayload = RandomDataUtil.generateUserUpdatePayload();
    const updateRoute = Routes.UPDATE_USER.replace('{id}', String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status(), 'The user workflow should update the created user').toBe(200);

    const updated = await updateResponse.json();
    expect(updated.id, 'The update response should use the created user ID').toBe(created.id);
    expect(updated).toMatchObject(updatePayload);

    const deleteRoute = Routes.DELETE_USER.replace('{id}', String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), 'The user workflow should delete the created user').toBe(200);
  });

  test('POST, PUT, DELETE - Cart CRUD workflow @master @regression @api', async ({ request }) => {
    const createPayload = RandomDataUtil.generateCartPayload(USER_ID);
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
      data: createPayload,
    });
    expect(createResponse.status(), 'The cart workflow should create a cart').toBe(201);

    const created = await createResponse.json();
    expect(created.id, 'The create response should return a cart ID').toEqual(expect.any(Number));
    expect(created.userId).toBe(createPayload.userId);
    expect(created.products).toEqual(createPayload.products);

    const updatePayload = {
      ...RandomDataUtil.generateUpdatedCartPayload(USER_ID),
      products: [
        {
          productId: createPayload.products[0].productId,
          quantity: createPayload.products[0].quantity + 1,
        },
      ],
    };
    const updateRoute = Routes.UPDATE_CART.replace('{id}', String(created.id));
    const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status(), 'The cart workflow should update the created cart').toBe(200);

    const updated = await updateResponse.json();
    expect(updated.id, 'The update response should use the created cart ID').toBe(created.id);
    expect(updated.userId).toBe(updatePayload.userId);
    expect(updated.products, 'The updated response should contain the changed quantity').toEqual(
      updatePayload.products,
    );

    const deleteRoute = Routes.DELETE_CART.replace('{id}', String(created.id));
    const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), 'The cart workflow should delete the created cart').toBe(200);
  });
});
