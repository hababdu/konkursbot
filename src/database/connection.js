const { Sequelize } = require('sequelize');
const config = require('../config/config');

let sequelize;

if (config.db.url) {
  // Neon, Supabase va shunga o'xshash provayderlar bitta connection-string beradi.
  // Bu holatlarda SSL majburiy bo'ladi.
  sequelize = new Sequelize(config.db.url, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else if (config.db.dialect === 'postgres') {
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
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.db.storage,
    logging: false,
  });
}

module.exports = sequelize;
