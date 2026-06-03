const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Plane = require('./Plane');

const Flight = sequelize.define('Flight', {
  destination: { type: DataTypes.STRING, allowNull: false },
  pilot: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'On Time' }
});

Plane.hasMany(Flight);
Flight.belongsTo(Plane);

module.exports = Flight;