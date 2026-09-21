const { User } = require('../database/models');

/**
 * Foydalanuvchining umumiy ballini qayta hisoblaydi:
 * umumiyBall = quizPoints + referralPoints
 */
async function recalculateTotalPoints(userId) {
  const user = await User.findByPk(userId);
  if (!user) return null;

  user.totalPoints = (user.quizPoints || 0) + (user.referralPoints || 0);
  await user.save();
  return user;
}

/**
 * Reytingni umumiy ball bo'yicha kamayish tartibida qaytaradi.
 */
async function getLeaderboard(limit = 10) {
  return User.findAll({
    where: { isBlocked: false },
    order: [['totalPoints', 'DESC']],
    limit,
  });
}

module.exports = { recalculateTotalPoints, getLeaderboard };
