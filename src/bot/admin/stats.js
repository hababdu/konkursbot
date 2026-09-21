const isAdmin = require('../middlewares/isAdmin');
const { User, Referral } = require('../../database/models');

function registerStatsAdmin(bot) {
  bot.hears('📊 Statistika', async (ctx) => {
    if (!isAdmin(ctx)) return;

    const totalUsers = await User.count();
    const subscribedUsers = await User.count({ where: { isSubscribed: true } });
    const totalReferrals = await Referral.count({ where: { isConfirmed: true } });
    const suspiciousReferrals = await Referral.count({ where: { isSuspicious: true } });

    await ctx.reply(
      `📊 Umumiy statistika:\n\n` +
      `👥 Jami foydalanuvchilar: ${totalUsers}\n` +
      `✅ Obuna bo'lganlar: ${subscribedUsers}\n` +
      `🔗 Tasdiqlangan referallar: ${totalReferrals}\n` +
      `⚠️ Shubhali referallar: ${suspiciousReferrals}`
    );
  });
}

module.exports = registerStatsAdmin;
