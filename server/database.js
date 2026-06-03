const { Sequelize } = require('sequelize');

const IS_RENDER = process.env.PORT || process.env.RENDER;
let sequelize;

if (IS_RENDER) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false 
      }
    },
    logging: false
  });
  console.log('☁️ Sequelize configurat pentru PostgreSQL (Mod Cloud).');
} else {
  sequelize = new Sequelize('CalypsoAirDB', 'calypso_user', 'Parola123!', {
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
  console.log('💻 Sequelize configurat pentru SQL Server (Mod Local).');
}

module.exports = sequelize;