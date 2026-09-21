const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Contest = sequelize.define('Contest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.TEXT,

  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,

  status: {
    // draft -> active -> finished
    type: DataTypes.ENUM('draft', 'active', 'finished'),
    defaultValue: 'draft',
  },

  referralPointsPerInvite: {
    // shu konkurs uchun bitta tasdiqlangan referal necha ball berishi
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },

  // Sovg'a o'rinlari JSON ko'rinishida saqlanadi, masalan:
  // [{ place: 1, prize: "Smartfon" }, { place: 2, prize: "Kitob to'plami" }]
  prizes: {
    type: DataTypes.JSON,
    defaultValue: [],
  },

  autoAnnounceResults: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  resultsAnnounced: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'contests',
  timestamps: true,
});

module.exports = Contest;
