const { Markup } = require('telegraf');
const isAdmin = require('../middlewares/isAdmin');
const { Contest, Book } = require('../../database/models');

const wizardStates = new Map(); // key: adminId -> { step, data }

function registerContestsAdmin(bot) {
  bot.hears('📖 Konkurslar', async (ctx) => {
    if (!isAdmin(ctx)) return;

    const contests = await Contest.findAll({ order: [['createdAt', 'DESC']], limit: 10 });
    let text = '📖 Konkurslar ro\'yxati:\n\n';
    if (contests.length === 0) {
      text += 'Hozircha konkurs yaratilmagan.\n';
    } else {
      contests.forEach((c) => {
        text += `#${c.id} ${c.title} — [${c.status}]\n`;
      });
    }

    await ctx.reply(text, Markup.inlineKeyboard([
      [Markup.button.callback('➕ Yangi konkurs yaratish', 'admin_new_contest')],
    ]));
  });

  bot.action('admin_new_contest', async (ctx) => {
    if (!isAdmin(ctx)) return;
    wizardStates.set(ctx.from.id, { step: 'title', data: {} });
    await ctx.answerCbQuery();
    await ctx.reply('📝 Konkurs nomini kiriting:');
  });

  bot.on('text', async (ctx, next) => {
    const state = wizardStates.get(ctx.from.id);
    if (!state) return next();
    if (!isAdmin(ctx)) return next();

    const text = ctx.message.text.trim();

    switch (state.step) {
      case 'title':
        state.data.title = text;
        state.step = 'startDate';
        return ctx.reply('📅 Boshlanish sanasini kiriting (YYYY-MM-DD):');

      case 'startDate':
        state.data.startDate = new Date(text);
        state.step = 'endDate';
        return ctx.reply('📅 Tugash sanasini kiriting (YYYY-MM-DD):');

      case 'endDate':
        state.data.endDate = new Date(text);
        state.step = 'referralPoints';
        return ctx.reply('💰 Har bir tasdiqlangan referal uchun ball miqdorini kiriting (masalan: 5):');

      case 'referralPoints':
        state.data.referralPointsPerInvite = Number(text) || 5;
        state.step = 'prizes';
        return ctx.reply(
          '🎁 Sovg\'alarni kiriting. Har bir qatorga bitta o\'rin, format: "1-o\'rin: Smartfon".\n' +
          'Barcha o\'rinlarni kiritib bo\'lgach, "tayyor" deb yozing.'
        );

      case 'prizes':
        if (text.toLowerCase() === 'tayyor') {
          const contest = await Contest.create({
            ...state.data,
            status: 'draft',
          });
          wizardStates.delete(ctx.from.id);
          return ctx.reply(
            `✅ Konkurs yaratildi (#${contest.id}, holati: draft).\n\n` +
            `Endi "📚 Kitob/Testlar" bo'limidan shu konkurs uchun kitob va savollar qo'shing.\n` +
            `Tayyor bo'lgach, konkursni faollashtirish uchun dasturchi bilan bog'laning yoki admin komandasidan foydalaning.`
          );
        }
        if (!state.data.prizes) state.data.prizes = [];
        const [place, prize] = text.split(':').map((s) => s.trim());
        state.data.prizes.push({ place: state.data.prizes.length + 1, prize: prize || place });
        return ctx.reply(`Qo'shildi: ${text}\nYana qo'shing yoki "tayyor" deb yozing.`);

      default:
        return next();
    }
  });
}

module.exports = registerContestsAdmin;
