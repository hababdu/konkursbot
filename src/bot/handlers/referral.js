const { Referral } = require('../../database/models');
const config = require('../../config/config');

function registerReferralHandler(bot) {
  bot.hears('👥 Do\'stlarimni taklif qilish', async (ctx) => {
    const userId = ctx.from.id;
    const link = `https://t.me/${config.botUsername}?start=ref_${userId}`;

    const confirmedCount = await Referral.count({ where: { referrerId: userId, isConfirmed: true } });

    await ctx.reply(
      `👥 Do'stlaringizni taklif qiling va qo'shimcha ball yig'ing!\n\n` +
      `🔗 Sizning referal havolangiz:\n${link}\n\n` +
      `✅ Tasdiqlangan takliflar soni: ${confirmedCount}\n` +
      `💰 Har bir tasdiqlangan taklif uchun: ${config.scoring.defaultReferralPoints} ball`
    );
  });
}

module.exports = registerReferralHandler;
