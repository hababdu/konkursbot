const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Channel = sequelize.define('Channel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  chatId: {
    // Telegram kanal ID (masalan: -1001234567890)
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  username: DataTypes.STRING, // @kanal_nomi (bo'lsa)
  inviteLink: DataTypes.STRING, // agar yopiq kanal bo'lsa
  title: DataTypes.STRING,
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'channels',
  timestamps: true,
});

module.exports = Channel;
