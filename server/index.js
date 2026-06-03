const express = require('express');
const https = require('https');
const http = require('http'); 
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const sequelize = require('./database');
const Flight = require('./models/Flight');
const Plane = require('./models/Plane');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const flightRoutes = require('./routes/flightRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);

const IS_RENDER = process.env.PORT || process.env.RENDER;
const PORT = process.env.PORT || 3001;

let server;

if (IS_RENDER) {
    server = http.createServer(app);
    console.log('☁️ Server configurat în mod CLOUD (HTTP Proxy).');
} else {
    const sslOptions = {
        key: fs.readFileSync(path.join(__dirname, 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
    };
    server = https.createServer(sslOptions, app);
    console.log('💻 Server configurat în mod LOCAL (HTTPS).');
}

const io = new Server(server, { cors: { origin: "*" } });

let generatorInterval = null;

app.post('/api/generator/start', (req, res) => {
    if (!generatorInterval) {
        console.log('✈️ Generatorul de zboruri a fost pornit...');
        
        generatorInterval = setInterval(async () => {
            try {
                const { faker } = require('@faker-js/faker');
                
                const id = Math.floor(10000 + Math.random() * 90000).toString();
                const destination = faker.airline ? faker.airline.airport().name : faker.location.city();
                const pilot = faker.person.fullName();

                const testPlane = await Plane.findOne();
                const planeId = testPlane ? testPlane.id : null;

                const noulZbor = await Flight.create({
                    id,
                    destination,
                    pilot,
                    status: 'On Time',
                    PlaneId: planeId
                });

                io.emit('flight-created', noulZbor);
                io.emit('flight_added', noulZbor);
                io.emit('flight', noulZbor);

                console.log(`[Generator] Zbor generat cu succes: ${id} către ${destination}`);
            } catch (err) {
                console.error('Eroare în generator la crearea zborului:', err.message);
            }
        }, 5000); 
    }
    res.json({ success: true, message: 'Generator started' });
});

app.post('/api/generator/stop', (req, res) => {
    if (generatorInterval) {
        clearInterval(generatorInterval);
        generatorInterval = null;
        console.log('🛑 Generatorul de zboruri a fost oprit.');
    }
    res.json({ success: true, message: 'Generator stopped' });
});

app.all('/api/flights/sync', async (req, res) => {
    try {
        const zboruri = await Flight.findAll({ include: Plane });
        res.json(zboruri);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const syncDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');
        
        await sequelize.sync({ alter: true }); 
        console.log('Database synced.');

        let testPlane = await Plane.findOne();
        if (!testPlane) {
            testPlane = await Plane.create({ model: 'Boeing 737', capacity: 180 });
            await Flight.create({
                id: "12345", 
                destination: "Cluj-Napoca",
                pilot: "Capitanul Andrei",
                PlaneId: testPlane.id
            });
            console.log('Initial test data created.');
        }
    } catch (err) {
        console.error('Database connection error:', err);
    }
};

if (process.env.NODE_ENV !== 'test') {
    syncDB();
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = { app, server };