const { Contest, User } = require('../database/models');
const { Op } = require('sequelize');

/**
 * Faol konkursni topadi (bitta vaqtda odatda bitta faol konkurs bo'ladi).
 */
async function getActiveContest() {
  return Contest.findOne({ where: { status: 'active' } });
}

/**
 * Konkursni yakunlaydi: statusni 'finished' qiladi va
 * agar autoAnnounceResults yoqilgan bo'lsa, g'oliblarni tayyorlaydi.
 */
async function finishContest(contestId) {
  const contest = await Contest.findByPk(contestId);
  if (!contest) throw new Error('Konkurs topilmadi');

  contest.status = 'finished';
  await contest.save();

  const winners = await getWinners(contest);
  return { contest, winners };
}

/**
 * prizes massividagi o'rinlar soniga qarab TOP foydalanuvchilarni qaytaradi.
 * Masalan prizes.length = 3 bo'lsa, TOP-3 foydalanuvchi qaytariladi.
 */
async function getWinners(contest) {
  const placesCount = (contest.prizes || []).length || 1;

  const topUsers = await User.findAll({
    where: { isBlocked: false, totalPoints: { [Op.gt]: 0 } },
    order: [['totalPoints', 'DESC']],
    limit: placesCount,
  });

  return topUsers.map((user, index) => ({
    place: index + 1,
    user,
    prize: contest.prizes[index]?.prize || null,
  }));
}

module.exports = { getActiveContest, finishContest, getWinners };
