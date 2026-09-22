const { DataTypes } = require('sequelize');
const sequelize = require('../connection');
const  Question  = require('./Question'); // yoki fayl joylashgan yo'lga qarab to'g'ri ko'rsating
const UserAnswer = sequelize.define('UserAnswer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  selectedOptionIndex: DataTypes.INTEGER,
  isCorrect: DataTypes.BOOLEAN,
  earnedPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'user_answers',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'questionId'], // bitta savolga bitta marta javob
    },
  ],
});

// Test bo'yicha alohida jadval: bir foydalanuvchi bir kitob testini
// faqat bir marta boshlashi/tugatishi mumkinligini nazorat qilish uchun
const UserQuizAttempt = sequelize.define('UserQuizAttempt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed'),
    defaultValue: 'in_progress',
  },
  totalEarnedPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'user_quiz_attempts',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'bookId'], // bitta kitob testi - bir marta
    },
  ],
});

module.exports = { UserAnswer, UserQuizAttempt };

// Test tugagach ball hisoblash uchun UserAnswer -> Question bog'lanishi kerak
// (finishQuiz funksiyasi shu bog'lanish orqali savollarni kitob bo'yicha filtrlaydi)
UserAnswer.belongsTo(Question, { foreignKey: 'questionId' });
Question.hasMany(UserAnswer, { foreignKey: 'questionId' });