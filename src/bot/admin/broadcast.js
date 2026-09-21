const isAdmin = require('../middlewares/isAdmin');
const { User } = require('../../database/models');

const waitingForBroadcast = new Set();

function registerBroadcastAdmin(bot) {
  bot.hears('📤 Xabar yuborish', async (ctx) => {
    if (!isAdmin(ctx)) return;
    waitingForBroadcast.add(ctx.from.id);
    await ctx.reply('✏️ Barcha foydalanuvchilarga yubormoqchi bo\'lgan xabar matnini kiriting:');
  });

  bot.on('text', async (ctx, next) => {
    if (!waitingForBroadcast.has(ctx.from.id)) return next();
    if (!isAdmin(ctx)) return next();

    waitingForBroadcast.delete(ctx.from.id);
    const text = ctx.message.text;

    const users = await User.findAll({ where: { isBlocked: false } });
    let sent = 0;
    for (const user of users) {
      try {
        await ctx.telegram.sendMessage(user.telegramId, text);
        sent += 1;
      } catch (err) {
        // bloklangan/o'chirilgan akkountlar o'tkazib yuboriladi
      }
    }

    await ctx.reply(`✅ Xabar ${sent} ta foydalanuvchiga yuborildi.`);
  });
}

module.exports = registerBroadcastAdmin;
