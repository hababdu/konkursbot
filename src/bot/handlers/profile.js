const { User, Referral } = require('../../database/models');

function registerProfileHandler(bot) {
  bot.hears('👤 Mening profilim', async (ctx) => {
    const userId = ctx.from.id;
    const user = await User.findByPk(userId);
    if (!user) return ctx.reply('Iltimos, avval /start bosing.');

    const referralCount = await Referral.count({ where: { referrerId: userId, isConfirmed: true } });

    await ctx.reply(
      `👤 Sizning profilingiz:\n\n` +
      `📚 Testlardan ball: ${user.quizPoints}\n` +
      `👥 Referaldan ball: ${user.referralPoints} (${referralCount} ta tasdiqlangan taklif)\n` +
      `🏆 Umumiy ball: ${user.totalPoints}`
    );
  });

  bot.hears('ℹ️ Konkurs shartlari', async (ctx) => {
    await ctx.reply(
      `ℹ️ Konkurs shartlari:\n\n` +
      `1. Majburiy kanallarga obuna bo'ling\n` +
      `2. Kitoblar bo'yicha testlarni ishlang\n` +
      `3. Do'stlaringizni taklif qilib qo'shimcha ball yig'ing\n` +
      `4. Eng ko'p ball to'plagan ishtirokchilar sovg'alarga sazovor bo'ladi\n\n` +
      `Umumiy ball = Test ballari + Referal ballari`
    );
  });
}

module.exports = registerProfileHandler;
