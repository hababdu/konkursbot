const { User, Channel } = require('../../database/models');
const { checkAllChannelsSubscription } = require('../../services/subscriptionService');
const { subscriptionKeyboard, mainMenuKeyboard } = require('../keyboards/mainMenu');
const { registerReferral } = require('../../services/referralService');

function registerStartHandler(bot) {
  bot.start(async (ctx) => {
    const telegramId = ctx.from.id;
    const payload = ctx.startPayload; // masalan "ref_123456789"

    let user = await User.findByPk(telegramId);

    if (!user) {
      user = await User.create({
        telegramId,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
      });

      // Agar referal havola orqali kirgan bo'lsa
      if (payload && payload.startsWith('ref_')) {
        const referrerId = Number(payload.replace('ref_', ''));
        if (referrerId && referrerId !== telegramId) {
          await registerReferral(referrerId, telegramId);
          user.referredBy = referrerId;
          await user.save();
        }
      }
    }

    const channels = await Channel.findAll({ where: { isActive: true } });

    if (channels.length === 0) {
      await ctx.reply('👋 Xush kelibsiz! Konkursga xush kelibsiz.', mainMenuKeyboard);
      return;
    }

    const { allSubscribed, notSubscribed } = await checkAllChannelsSubscription(bot, telegramId);

    if (allSubscribed) {
      user.isSubscribed = true;
      await user.save();
      await ctx.reply(
        '👋 Xush kelibsiz! Siz barcha majburiy kanallarga obunasiz.\n\nKonkursda ishtirok etish uchun quyidagi menyudan foydalaning:',
        mainMenuKeyboard
      );
    } else {
      await ctx.reply(
        '👋 Assalomu alaykum!\n\nKonkursda qatnashish uchun avval quyidagi kanallarga obuna bo\'ling:',
        subscriptionKeyboard(notSubscribed)
      );
    }
  });
}

module.exports = registerStartHandler;
