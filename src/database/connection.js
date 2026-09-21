const { Sequelize } = require('sequelize');
const config = require('../config/config');

let sequelize;

if (config.db.dialect === 'postgres') {
  sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    {
      host: config.db.host,
      port: config.db.port,
      dialect: 'postgres',
      logging: false,
    }
  );
} else {
  // sqlite - qo'shimcha sozlashsiz, tez ishga tushirish uchun
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.db.storage,
    logging: false,
  });
}

module.exports = sequelize;
