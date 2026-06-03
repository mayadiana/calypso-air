const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const Plane = require('../models/Plane');
const protect = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const startIndex = (page - 1) * limit;

    const { count, rows } = await Flight.findAndCountAll({
      limit: limit,
      offset: startIndex,
      include: Plane
    });

    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, destination, pilot, PlaneId } = req.body;

    if (!id || typeof id !== 'string' || id.trim() === '') return res.status(400).json({ error: "Invalid or missing ID" });
    if (!destination || destination.length < 3) return res.status(400).json({ error: "Destination must be at least 3 characters" });
    if (!pilot || pilot.trim() === '') return res.status(400).json({ error: "Pilot name is required" });

    const existingFlight = await Flight.findByPk(id);
    if (existingFlight) return res.status(400).json({ error: "Flight ID already exists on server" });

    const newFlight = await Flight.create({ 
      id, 
      destination, 
      pilot, 
      status: 'On Time',
      PlaneId: PlaneId || null 
    });

    res.status(201).json(newFlight);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedLength = await Flight.destroy({
      where: { id: req.params.id }
    });

    if (deletedLength === 0) return res.status(404).json({ error: "Flight not found" });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;