const { getLeaderboard } = require('../../services/scoreService');
const { User } = require('../../database/models');

function registerRatingHandler(bot) {
  bot.hears('🏆 Reyting', async (ctx) => {
    const top = await getLeaderboard(10);

    if (top.length === 0) {
      return ctx.reply('Hozircha reytingda hech kim yo\'q.');
    }

    let text = '🏆 TOP-10 ishtirokchilar:\n\n';
    top.forEach((user, index) => {
      const name = user.firstName || user.username || `ID:${user.telegramId}`;
      text += `${index + 1}. ${name} — ${user.totalPoints} ball\n`;
    });

    // Foydalanuvchining o'z o'rnini ham ko'rsatish (agar TOP-10da bo'lmasa)
    const allUsers = await User.findAll({
      where: { isBlocked: false },
      order: [['totalPoints', 'DESC']],
    });
    const myIndex = allUsers.findIndex((u) => u.telegramId === ctx.from.id);
    if (myIndex >= 10) {
      text += `\n...\nSizning o'rningiz: ${myIndex + 1}-o'rin (${allUsers[myIndex].totalPoints} ball)`;
    }

    await ctx.reply(text);
  });
}

module.exports = registerRatingHandler;
