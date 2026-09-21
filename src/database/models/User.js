const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const User = sequelize.define('User', {
  telegramId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
  },
  username: DataTypes.STRING,
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,

  isSubscribed: {
    // majburiy kanallarga oxirgi tekshiruvda obuna bo'lgan-bo'lmaganligi
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  referredBy: {
    // uni taklif qilgan foydalanuvchining telegramId'si
    type: DataTypes.BIGINT,
    allowNull: true,
  },

  quizPoints: {
    // testlardan yig'ilgan ball
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  referralPoints: {
    // referaldan yig'ilgan ball
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalPoints: {
    // quizPoints + referralPoints (avtomatik hisoblanadi)
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
