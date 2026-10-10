import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';

dotenv.config();

test.describe('FakeStore Authentication API Tests', () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

  test('POST - Login with valid credentials @master @sanity @api', async ({ request }) => {
    const userResponse = await request.get(
      `${BASE_URL}${Routes.GET_USER_BY_ID.replace('{id}', '1')}`,
    );
    expect(userResponse.status(), 'A seed user must be available to obtain valid credentials').toBe(200);

    const user = await userResponse.json();
    expect(user.username, 'The seed user must provide a username').toEqual(expect.any(String));
    expect(user.password, 'The seed user must provide a password').toEqual(expect.any(String));

    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: { username: user.username, password: user.password },
    });
    expect(response.status(), 'Valid credentials should be accepted').toBe(201);

    const body = await response.json();
    expect(body.token, 'A successful login should return a non-empty token').toEqual(
      expect.stringMatching(/\S+/),
    );
  });

  test('POST - Login with invalid credentials @master @regression @api', async ({ request }) => {
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: {
        username: `invalid-${Date.now()}`,
        password: `invalid-${Date.now()}`,
      },
    });
    expect(response.status(), 'Invalid credentials should be rejected').toBe(401);

    const body = await response.json();
    expect(body.message, 'The API should explain why authentication failed').toBe(
      'username or password is incorrect',
    );
  });
});
