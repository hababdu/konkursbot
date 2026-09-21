const { DataTypes } = require('sequelize');
const sequelize = require('../connection');
const Contest = require('./Contest');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: DataTypes.STRING,
  contestId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'books',
  timestamps: true,
});

Book.belongsTo(Contest, { foreignKey: 'contestId' });
Contest.hasMany(Book, { foreignKey: 'contestId' });

module.exports = Book;
