import { test, expect } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import path from 'path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';

dotenv.config();

test.describe('FakeStore API Schema Tests', () => {
  const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
  const PRODUCT_ID = 1;
  const USER_ID = 1;
  const CART_ID = 1;
  const ajv = new Ajv();

  test('GET - Product response schema @master @regression @api', async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'The product schema endpoint should return HTTP 200').toBe(200);

    const product = await response.json();
    const schema = DataProvider.readJson(path.resolve(__dirname, '../../api/schemas/product_api_schema.json'));
    const validate = ajv.compile(schema);
    const isValid = validate(product);
    expect(isValid, `Product response schema errors: ${ajv.errorsText(validate.errors)}`).toBe(true);
  });

  test('GET - User response schema @master @regression @api', async ({ request }) => {
    const route = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'The user schema endpoint should return HTTP 200').toBe(200);

    const user = await response.json();
    const schema = DataProvider.readJson(path.resolve(__dirname, '../../api/schemas/user_api_schema.json'));
    const validate = ajv.compile(schema);
    const isValid = validate(user);
    expect(isValid, `User response schema errors: ${ajv.errorsText(validate.errors)}`).toBe(true);
  });

  test('GET - Cart response schema @master @regression @api', async ({ request }) => {
    const route = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status(), 'The cart schema endpoint should return HTTP 200').toBe(200);

    const cart = await response.json();
    const schema = DataProvider.readJson(path.resolve(__dirname, '../../api/schemas/cart_api_schema.json'));
    const validate = ajv.compile(schema);
    const isValid = validate(cart);
    expect(isValid, `Cart response schema errors: ${ajv.errorsText(validate.errors)}`).toBe(true);
  });
});
