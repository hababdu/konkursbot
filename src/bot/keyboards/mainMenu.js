const { Markup } = require('telegraf');

const mainMenuKeyboard = Markup.keyboard([
  ['📚 Testni boshlash'],
  ['🏆 Reyting', '👥 Do\'stlarimni taklif qilish'],
  ['👤 Mening profilim', 'ℹ️ Konkurs shartlari'],
]).resize();

function subscriptionKeyboard(channels) {
  const buttons = channels.map((ch) => [
    Markup.button.url(
      `📢 ${ch.title || ch.username}`,
      ch.inviteLink || `https://t.me/${(ch.username || '').replace('@', '')}`
    ),
  ]);
  buttons.push([Markup.button.callback('✅ Obunani tekshirish', 'check_subscription')]);
  return Markup.inlineKeyboard(buttons);
}

module.exports = { mainMenuKeyboard, subscriptionKeyboard };
