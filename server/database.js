const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('CalypsoAirDB', 'calypso_user', 'Parola123!', {
  host: 'localhost',
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true 
    }
  },
  logging: false
});

module.exports = sequelize;