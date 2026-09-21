const { Markup } = require('telegraf');
const isAdmin = require('../middlewares/isAdmin');
const { Channel } = require('../../database/models');

// Oddiy holat-mashinasi (state machine) admin uchun, xotirada saqlanadi.
const adminStates = new Map(); // key: adminId, value: { action: 'awaiting_channel' }

function registerChannelsAdmin(bot) {
  bot.hears('📢 Kanallarni boshqarish', async (ctx) => {
    if (!isAdmin(ctx)) return;

    const channels = await Channel.findAll({ where: { isActive: true } });
    let text = '📢 Faol majburiy kanallar:\n\n';
    if (channels.length === 0) {
      text += 'Hozircha kanal qo\'shilmagan.';
    } else {
      channels.forEach((ch, i) => {
        text += `${i + 1}. ${ch.title || ch.username} (ID: ${ch.chatId})\n`;
      });
    }

    await ctx.reply(text, Markup.inlineKeyboard([
      [Markup.button.callback('➕ Kanal qo\'shish', 'admin_add_channel')],
      [Markup.button.callback('➖ Kanal o\'chirish', 'admin_remove_channel')],
    ]));
  });

  bot.action('admin_add_channel', async (ctx) => {
    if (!isAdmin(ctx)) return;
    adminStates.set(ctx.from.id, { action: 'awaiting_channel' });
    await ctx.answerCbQuery();
    await ctx.reply(
      '➕ Botni admin sifatida qo\'shmoqchi bo\'lgan kanalingizga qo\'shing, so\'ng kanal username\'ini ' +
      '(@kanal_nomi) yoki chat ID raqamini yuboring.'
    );
  });

  bot.action('admin_remove_channel', async (ctx) => {
    if (!isAdmin(ctx)) return;
    const channels = await Channel.findAll({ where: { isActive: true } });
    if (channels.length === 0) {
      await ctx.answerCbQuery();
      return ctx.reply('O\'chirish uchun kanal mavjud emas.');
    }
    const buttons = channels.map((ch) => [
      Markup.button.callback(`❌ ${ch.title || ch.username}`, `remove_channel_${ch.id}`),
    ]);
    await ctx.answerCbQuery();
    await ctx.reply('O\'chirmoqchi bo\'lgan kanalni tanlang:', Markup.inlineKeyboard(buttons));
  });

  bot.action(/remove_channel_(\d+)/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    const id = Number(ctx.match[1]);
    await Channel.update({ isActive: false }, { where: { id } });
    await ctx.answerCbQuery('O\'chirildi');
    await ctx.reply('✅ Kanal ro\'yxatdan olib tashlandi.');
  });

  // Matn xabarlarini kutilayotgan holatga qarab qayta ishlash
  bot.on('text', async (ctx, next) => {
    const state = adminStates.get(ctx.from.id);
    if (!state || state.action !== 'awaiting_channel') return next();

    const input = ctx.message.text.trim();

    try {
      const chat = await ctx.telegram.getChat(input);
      await Channel.create({
        chatId: chat.id,
        username: chat.username ? `@${chat.username}` : null,
        title: chat.title,
        inviteLink: chat.invite_link || null,
      });
      adminStates.delete(ctx.from.id);
      await ctx.reply(`✅ "${chat.title}" kanali majburiy obuna ro'yxatiga qo'shildi.`);
    } catch (err) {
      await ctx.reply(
        '❌ Kanal topilmadi. Bot shu kanalda admin ekanligiga va username/ID to\'g\'ri yozilganiga ishonch hosil qiling.'
      );
    }
  });
}

module.exports = registerChannelsAdmin;
