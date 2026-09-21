const { Markup } = require('telegraf');

const adminMenuKeyboard = Markup.keyboard([
  ['📢 Kanallarni boshqarish'],
  ['📖 Konkurslar', '📚 Kitob/Testlar'],
  ['📊 Statistika', '🏁 Konkursni yakunlash'],
  ['📤 Xabar yuborish'],
  ['⬅️ Chiqish'],
]).resize();

module.exports = { adminMenuKeyboard };
