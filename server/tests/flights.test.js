const request = require('supertest');
const { app, server } = require('../index.js');

describe('Flight API Comprehensive Tests', () => {
  afterAll(async () => {
    await request(app).post('/api/generator/stop');
    await new Promise((resolve) => server.close(resolve));
  });

  it('should return paginated data', async () => {
    const response = await request(app).get('/api/flights?page=1&limit=3');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('totalItems'); 
  });

  it('should fail if mandatory fields are missing', async () => {
    const response = await request(app).post('/api/flights').send({ id: "999" });
    expect(response.statusCode).toBe(400); 
  });

  it('should fail if destination is too short', async () => {
    const response = await request(app)
      .post('/api/flights')
      .send({ id: "101", destination: "Ab", pilot: "Test" });
    expect(response.statusCode).toBe(400); 
  });

  it('should fail if pilot name is empty', async () => {
    const response = await request(app)
      .post('/api/flights')
      .send({ id: "102", destination: "Berlin", pilot: "" });
    expect(response.statusCode).toBe(400); 
  });

  it('should fail if ID is duplicate', async () => {
    await request(app).post('/api/flights').send({ id: "1", destination: "Paris", pilot: "John" });
    const response = await request(app).post('/api/flights').send({ id: "1", destination: "Paris", pilot: "John" });
    expect(response.statusCode).toBe(400); 
  });

  it('should delete a flight and return 204', async () => {
    const response = await request(app).delete('/api/flights/1');
    expect(response.statusCode).toBe(204); 
  });

  it('should return 404 when deleting non-existent flight', async () => {
    const response = await request(app).delete('/api/flights/9999');
    expect(response.statusCode).toBe(404); 
  });

  it('should handle offline sync', async () => {
    const response = await request(app)
      .post('/api/flights/sync')
      .send([{ id: "sync-1", destination: "Cluj", pilot: "Pilot" }]);
    expect(response.statusCode).toBe(200); 
  });

  it('should start and stop the generator', async () => {
    jest.useFakeTimers();
    const start = await request(app).post('/api/generator/start');
    expect(start.statusCode).toBe(200); 

    jest.advanceTimersByTime(5001); 

    const stop = await request(app).post('/api/generator/stop');
    expect(stop.statusCode).toBe(200); 
    jest.useRealTimers();
  });

  it('should return 400 if generator is already running', async () => {
    await request(app).post('/api/generator/start');
    const response = await request(app).post('/api/generator/start');
    expect(response.statusCode).toBe(400);
    await request(app).post('/api/generator/stop'); 
  });
});