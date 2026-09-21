const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  referrerId: {
    // taklif qilgan foydalanuvchi
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  referredId: {
    // taklif qilingan (yangi) foydalanuvchi - har doim unikal
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
  },
  isConfirmed: {
    // faqat majburiy obunani to'liq bajargandan keyin true bo'ladi
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isSuspicious: {
    // soxta/shubhali deb belgilangan referal (admin panelda ko'rinadi)
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  pointsAwarded: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'referrals',
  timestamps: true,
});

module.exports = Referral;
