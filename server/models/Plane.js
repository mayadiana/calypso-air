const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Plane = sequelize.define('Plane', {
  model: { type: DataTypes.STRING, allowNull: false },
  capacity: { type: DataTypes.INTEGER }
});

module.exports = Plane;