import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
  address: {
    city: string;
    street: string;
    number: number;
    zipcode: string;
    geolocation: {
      lat: string;
      long: string;
    };
  };
  phone: string;
}

test.describe('FakeStore Users API Tests', () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const USER_ID = 1;
  const USER_LIMIT = 3;

  test('GET - All users @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status(), 'The users endpoint should return HTTP 200').toBe(200);

    const users: User[] = await response.json();
    expect(Array.isArray(users), 'The users response should be an array').toBe(true);
    expect(users.length, 'At least one user should be returned').toBeGreaterThan(0);
    for (const user of users) {
      expect(user.id, 'Each user should have a numeric ID').toEqual(expect.any(Number));
    }
  });

  test('GET - User by ID @master @sanity @api', async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'A valid user ID should return HTTP 200').toBe(200);

    const user: User = await response.json();
    expect(user.id, 'The response should contain the requested user').toBe(USER_ID);
    expect(user.username).toEqual(expect.any(String));
  });

  test('GET - Users with limit @master @sanity @api', async ({ request }) => {
    const route = Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(USER_LIMIT));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'The limited users endpoint should return HTTP 200').toBe(200);

    const users: User[] = await response.json();
    expect(Array.isArray(users), 'The limited users response should be an array').toBe(true);
    expect(users, 'The result count should match the requested limit').toHaveLength(USER_LIMIT);
  });

  for (const order of ['asc', 'desc'] as const) {
    test(`GET - Users sorted ${order} @master @sanity @api`, async ({ request }) => {
      const route = Routes.GET_USERS_SORTED.replace('{order}', order);
      const response = await request.get(`${BASE_URL}${route}`);
      expect(response.status(), `Sorting users ${order} should return HTTP 200`).toBe(200);

      const users: User[] = await response.json();
      expect(users.length, 'At least one user should be available to sort').toBeGreaterThan(0);
      const ids = users.map((user) => user.id);
      const sortedIds = [...ids].sort((left, right) => (order === 'asc' ? left - right : right - left));
      expect(ids, `User IDs should be ordered ${order}`).toEqual(sortedIds);
    });
  }

  test('POST - Create user @master @regression @api', async ({ request }) => {
    const payload = RandomDataUtil.generateUserPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: payload });
    expect(response.status(), 'Creating a user should return HTTP 201').toBe(201);

    const created: User = await response.json();
    expect(created.id, 'The created user should have a numeric ID').toEqual(expect.any(Number));
    expect(created).toMatchObject(payload);

    const deleteRoute = Routes.DELETE_USER.replace('{id}', String(created.id));
    const cleanupResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(cleanupResponse.status(), 'The created user should be removed after verification').toBe(200);
  });

  test('PUT - Update user @master @regression @api', async ({ request }) => {
    const createdResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
      data: RandomDataUtil.generateUserPayload(),
    });
    expect(createdResponse.status(), 'A user is needed before it can be updated').toBe(201);
    const created: User = await createdResponse.json();
    const payload = RandomDataUtil.generateUserUpdatePayload();
    const route = Routes.UPDATE_USER.replace('{id}', String(created.id));

    const response = await request.put(`${BASE_URL}${route}`, { data: payload });
    expect(response.status(), 'Updating a user should return HTTP 200').toBe(200);

    const updated: User = await response.json();
    expect(updated.id, 'The update should refer to the created user').toBe(created.id);
    expect(updated).toMatchObject(payload);

    const deleteRoute = Routes.DELETE_USER.replace('{id}', String(created.id));
    const cleanupResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
    expect(cleanupResponse.status(), 'The updated user should be removed after verification').toBe(200);
  });

  test('DELETE - User @master @regression @api', async ({ request }) => {
    const createdResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
      data: RandomDataUtil.generateUserPayload(),
    });
    expect(createdResponse.status(), 'A user is needed before it can be deleted').toBe(201);
    const created: User = await createdResponse.json();
    const route = Routes.DELETE_USER.replace('{id}', String(created.id));

    const response = await request.delete(`${BASE_URL}${route}`);
    expect(response.status(), 'Deleting a user should return HTTP 200').toBe(200);
    const deleted: User = await response.json();
    expect(deleted.id, 'The delete response should identify the deleted user').toBe(created.id);
  });
});
