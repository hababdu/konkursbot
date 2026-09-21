const { checkAllChannelsSubscription } = require('../../services/subscriptionService');
const { subscriptionKeyboard } = require('../keyboards/mainMenu');
const { User } = require('../../database/models');

/**
 * Har bir xabar/tugma bosilishidan oldin foydalanuvchining
 * majburiy obunasini tekshiradigan middleware.
 * /start va check_subscription tugmasi bundan mustasno (o'zlari tekshiradi).
 */
async function checkSubscriptionMiddleware(ctx, next) {
  const skipCommands = ['/start'];
  const isCheckAction = ctx.callbackQuery?.data === 'check_subscription';

  if (skipCommands.includes(ctx.message?.text) || isCheckAction) {
    return next();
  }

  const userId = ctx.from?.id;
  if (!userId) return next();

  const user = await User.findByPk(userId);

  if (!user || !user.isSubscribed) {
    const { allSubscribed, notSubscribed } = await checkAllChannelsSubscription(ctx.telegram, userId);

    if (!allSubscribed) {
      await ctx.reply(
        '⚠️ Davom etish uchun quyidagi kanallarga obuna bo\'ling va "Obunani tekshirish" tugmasini bosing:',
        subscriptionKeyboard(notSubscribed)
      );
      return; // keyingi handlerga o'tkazilmaydi
    }

    if (user) {
      user.isSubscribed = true;
      await user.save();
    }
  }

  return next();
}

module.exports = checkSubscriptionMiddleware;
