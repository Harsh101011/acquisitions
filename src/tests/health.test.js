import request from 'supertest';
import app from '../app.js';
import { describe, it, expect } from '@jest/globals';

describe('Health Check Endpoint', () => {
  it('should return 200 OK and status info', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });
});
