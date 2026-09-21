const { Channel } = require('../database/models');

/**
 * Foydalanuvchining barcha faol majburiy kanallarga obuna bo'lgan-bo'lmaganligini tekshiradi.
 * @param {import('telegraf').Telegraf} bot
 * @param {number} userId
 * @returns {Promise<{ allSubscribed: boolean, notSubscribed: Array }>}
 */
async function checkAllChannelsSubscription(bot, userId) {
  const channels = await Channel.findAll({ where: { isActive: true } });
  const notSubscribed = [];

  for (const channel of channels) {
    try {
      const member = await bot.telegram.getChatMember(channel.chatId, userId);
      const validStatuses = ['member', 'administrator', 'creator'];
      if (!validStatuses.includes(member.status)) {
        notSubscribed.push(channel);
      }
    } catch (err) {
      // Agar bot kanalda admin bo'lmasa yoki xato yuz bersa,
      // xavfsizlik uchun obuna bo'lmagan deb hisoblaymiz
      notSubscribed.push(channel);
    }
  }

  return {
    allSubscribed: notSubscribed.length === 0,
    notSubscribed,
  };
}

module.exports = { checkAllChannelsSubscription };
