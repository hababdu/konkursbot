const { Markup } = require('telegraf');
const isAdmin = require('../middlewares/isAdmin');
const { Contest, User } = require('../../database/models');
const { finishContest } = require('../../services/contestService');

function registerFinishContestAdmin(bot) {
  bot.hears('🏁 Konkursni yakunlash', async (ctx) => {
    if (!isAdmin(ctx)) return;

    const activeContests = await Contest.findAll({ where: { status: 'active' } });
    if (activeContests.length === 0) {
      // Draft holatidagilarni ham faollashtirish imkonini beramiz
      const draftContests = await Contest.findAll({ where: { status: 'draft' } });
      if (draftContests.length > 0) {
        const buttons = draftContests.map((c) => [
          Markup.button.callback(`▶️ Faollashtirish: #${c.id} ${c.title}`, `activate_contest_${c.id}`),
        ]);
        return ctx.reply('Faol konkurs yo\'q. Boshlash uchun tanlang:', Markup.inlineKeyboard(buttons));
      }
      return ctx.reply('Hozircha na faol, na tayyor konkurs mavjud.');
    }

    const buttons = activeContests.map((c) => [
      Markup.button.callback(`🏁 Yakunlash: #${c.id} ${c.title}`, `finish_contest_${c.id}`),
    ]);
    await ctx.reply('Qaysi konkursni yakunlaysiz?', Markup.inlineKeyboard(buttons));
  });

  bot.action(/activate_contest_(\d+)/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    const id = Number(ctx.match[1]);
    await Contest.update({ status: 'active' }, { where: { id } });
    await ctx.answerCbQuery();
    await ctx.reply('✅ Konkurs faollashtirildi. Endi foydalanuvchilar test ishlashi mumkin.');
  });

  bot.action(/finish_contest_(\d+)/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    const id = Number(ctx.match[1]);

    const { contest, winners } = await finishContest(id);
    await ctx.answerCbQuery();

    let resultText = `🏁 "${contest.title}" konkursi yakunlandi!\n\n🏆 G'oliblar:\n\n`;
    winners.forEach((w) => {
      const name = w.user.firstName || w.user.username || `ID:${w.user.telegramId}`;
      resultText += `${w.place}-o'rin: ${name} — ${w.user.totalPoints} ball` +
        (w.prize ? ` 🎁 ${w.prize}` : '') + '\n';
    });

    await ctx.reply(resultText);

    // Avtomatik e'lon qilish - agar yoqilgan bo'lsa, barcha foydalanuvchilarga yuboriladi
    if (contest.autoAnnounceResults) {
      const allUsers = await User.findAll({ where: { isBlocked: false } });
      for (const user of allUsers) {
        try {
          await ctx.telegram.sendMessage(user.telegramId, resultText);
        } catch (err) {
          // foydalanuvchi botni bloklagan bo'lishi mumkin, o'tkazib yuboramiz
        }
      }
      contest.resultsAnnounced = true;
      await contest.save();
      await ctx.reply('📢 Natijalar barcha foydalanuvchilarga avtomatik yuborildi.');
    }
  });
}

module.exports = registerFinishContestAdmin;
