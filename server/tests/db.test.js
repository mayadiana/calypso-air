const request = require('supertest');
const { app } = require('../index');
const sequelize = require('../database');
const Flight = require('../models/Flight');
const Plane = require('../models/Plane');

describe('Database CRUD Operations (Bronze Requirement)', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should create a new plane and flight (3NF Relationship)', async () => {
        const plane = await Plane.create({ model: 'Airbus A320', capacity: 150 });
        
        const res = await Flight.create({
            destination: 'Berlin',
            pilot: 'Popescu Ion',
            PlaneId: plane.id
        });

        expect(res.destination).toBe('Berlin');
        expect(res.PlaneId).toBe(plane.id);
    });

    it('should read flights from database', async () => {
        const flights = await Flight.findAll();
        expect(flights.length).toBeGreaterThan(0);
    });

    it('should update a flight', async () => {
        const flight = await Flight.findOne();
        flight.status = 'Delayed';
        await flight.save();
        
        const updated = await Flight.findByPk(flight.id);
        expect(updated.status).toBe('Delayed');
    });

    it('should delete a flight', async () => {
        const flight = await Flight.findOne();
        const id = flight.id;
        await flight.destroy();
        
        const deleted = await Flight.findByPk(id);
        expect(deleted).toBeNull();
    });
});