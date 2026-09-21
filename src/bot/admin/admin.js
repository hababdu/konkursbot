const isAdmin = require('../middlewares/isAdmin');
const { adminMenuKeyboard } = require('../keyboards/adminMenu');
const { mainMenuKeyboard } = require('../keyboards/mainMenu');

function registerAdminEntry(bot) {
  bot.command('admin', async (ctx) => {
    if (!isAdmin(ctx)) {
      return ctx.reply('⛔️ Sizda admin huquqi yo\'q.');
    }
    await ctx.reply('🛠 Admin panelga xush kelibsiz.', adminMenuKeyboard);
  });

  bot.hears('⬅️ Chiqish', async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.reply('Asosiy menyuga qaytdingiz.', mainMenuKeyboard);
  });
}

module.exports = registerAdminEntry;
