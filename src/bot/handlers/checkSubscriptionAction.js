const { User } = require('../../database/models');
const { checkAllChannelsSubscription } = require('../../services/subscriptionService');
const { subscriptionKeyboard, mainMenuKeyboard } = require('../keyboards/mainMenu');
const { confirmReferralIfExists } = require('../../services/referralService');

function registerCheckSubscriptionAction(bot) {
  bot.action('check_subscription', async (ctx) => {
    const telegramId = ctx.from.id;
    const { allSubscribed, notSubscribed } = await checkAllChannelsSubscription(bot, telegramId);

    if (allSubscribed) {
      const user = await User.findByPk(telegramId);
      const wasAlreadySubscribed = user.isSubscribed;
      user.isSubscribed = true;
      await user.save();

      // Faqat birinchi marta tasdiqlanganda referal ballini beramiz
      if (!wasAlreadySubscribed) {
        await confirmReferralIfExists(telegramId);
      }

      await ctx.editMessageText('✅ Tabriklaymiz! Siz barcha kanallarga obuna bo\'ldingiz.');
      await ctx.reply('Konkursda ishtirok etish uchun menyudan foydalaning:', mainMenuKeyboard);
    } else {
      await ctx.answerCbQuery('❌ Siz hali barcha kanallarga obuna bo\'lmagansiz!', { show_alert: true });
      await ctx.editMessageReplyMarkup(subscriptionKeyboard(notSubscribed).reply_markup);
    }
  });
}

module.exports = registerCheckSubscriptionAction;
