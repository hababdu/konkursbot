const { DataTypes } = require('sequelize');
const sequelize = require('../connection');
const Book = require('./Book');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  // Variantlar soni 3 yoki 4 bo'lishi mumkin, admin tanlaydi.
  // options: ["Variant A", "Variant B", "Variant C", "Variant D"?]
  options: {
    type: DataTypes.JSON,
    allowNull: false,
  },

  correctOptionIndex: {
    // to'g'ri javob variantining indeksi (0 dan boshlab)
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  points: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },

  order: {
    // savol tartib raqami test ichida
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'questions',
  timestamps: true,
});

Question.belongsTo(Book, { foreignKey: 'bookId' });
Book.hasMany(Question, { foreignKey: 'bookId' });

module.exports = Question;
