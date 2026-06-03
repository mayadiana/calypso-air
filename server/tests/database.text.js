const request = require('supertest');
const { app } = require('../index'); 
const sequelize = require('../database');
const Plane = require('../models/Plane');
const Flight = require('../models/Flight');

describe('Database CRUD Tests (Bronze Requirement)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a plane and a flight (3NF Check)', async () => {
    const plane = await Plane.create({ model: 'Airbus A320', capacity: 150 });
    
    const response = await request(app)
      .post('/api/flights')
      .send({
        id: "SQL-100",
        destination: "Rome",
        pilot: "Marco Rossi",
        PlaneId: plane.id
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.destination).toBe("Rome");
  });

  it('should get all flights from database', async () => {
    const response = await request(app).get('/api/flights');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should update flight status in SQL Server', async () => {
    const response = await request(app)
      .put('/api/flights/SQL-100')
      .send({ status: 'Delayed' });

    expect(response.statusCode).toBe(200);
  });

  it('should delete a flight from database', async () => {
    const response = await request(app).delete('/api/flights/SQL-100');
    expect(response.statusCode).toBe(204);
  });
});