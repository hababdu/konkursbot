const { Markup } = require('telegraf');
const isAdmin = require('../middlewares/isAdmin');
const { Contest, Book, Question } = require('../../database/models');

const wizardStates = new Map();

function registerQuestionsAdmin(bot) {
  bot.hears('📚 Kitob/Testlar', async (ctx) => {
    if (!isAdmin(ctx)) return;

    const contests = await Contest.findAll({ where: { status: ['draft', 'active'] } });
    if (contests.length === 0) {
      return ctx.reply('Avval "📖 Konkurslar" bo\'limidan konkurs yarating.');
    }

    const buttons = contests.map((c) => [Markup.button.callback(`#${c.id} ${c.title}`, `admin_select_contest_${c.id}`)]);
    await ctx.reply('Qaysi konkurs uchun kitob/test qo\'shmoqchisiz?', Markup.inlineKeyboard(buttons));
  });

  bot.action(/admin_select_contest_(\d+)/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    const contestId = Number(ctx.match[1]);
    wizardStates.set(ctx.from.id, { step: 'book_title', data: { contestId } });
    await ctx.answerCbQuery();
    await ctx.reply('📖 Kitob nomini kiriting:');
  });

  bot.on('text', async (ctx, next) => {
    const state = wizardStates.get(ctx.from.id);
    if (!state || !isAdmin(ctx)) return next();

    const text = ctx.message.text.trim();

    switch (state.step) {
      case 'book_title': {
        const book = await Book.create({ title: text, contestId: state.data.contestId });
        state.data.bookId = book.id;
        state.step = 'options_count';
        return ctx.reply('🔢 Bu kitobdagi testlar necha variantli bo\'ladi? (3 yoki 4):');
      }

      case 'options_count': {
        const count = Number(text);
        if (![3, 4].includes(count)) {
          return ctx.reply('Iltimos, faqat 3 yoki 4 raqamini kiriting.');
        }
        state.data.optionsCount = count;
        state.data.questionOrder = 0;
        state.step = 'question_text';
        return ctx.reply('❓ 1-savol matnini kiriting (yoki tugatish uchun "tugadi" deb yozing):');
      }

      case 'question_text': {
        if (text.toLowerCase() === 'tugadi') {
          wizardStates.delete(ctx.from.id);
          return ctx.reply('✅ Savollar qo\'shish yakunlandi.');
        }
        state.data.currentQuestionText = text;
        state.data.currentOptions = [];
        state.step = 'question_options';
        return ctx.reply(`✏️ 1-variantni kiriting (jami ${state.data.optionsCount} ta variant kerak):`);
      }

      case 'question_options': {
        state.data.currentOptions.push(text);
        const need = state.data.optionsCount;
        const have = state.data.currentOptions.length;

        if (have < need) {
          return ctx.reply(`✏️ ${have + 1}-variantni kiriting:`);
        }

        state.step = 'correct_option';
        return ctx.reply(
          `✅ To'g'ri javob raqamini kiriting (1 dan ${need} gacha):\n\n` +
          state.data.currentOptions.map((o, i) => `${i + 1}. ${o}`).join('\n')
        );
      }

      case 'correct_option': {
        const correctIndex = Number(text) - 1;
        if (Number.isNaN(correctIndex) || correctIndex < 0 || correctIndex >= state.data.currentOptions.length) {
          return ctx.reply('Noto\'g\'ri raqam. Qaytadan kiriting:');
        }
        state.data.currentCorrectIndex = correctIndex;
        state.step = 'question_points';
        return ctx.reply('💰 Bu savol necha ball turadi? (masalan: 1):');
      }

      case 'question_points': {
        const points = Number(text) || 1;

        await Question.create({
          bookId: state.data.bookId,
          text: state.data.currentQuestionText,
          options: state.data.currentOptions,
          correctOptionIndex: state.data.currentCorrectIndex,
          points,
          order: state.data.questionOrder,
        });

        state.data.questionOrder += 1;
        state.step = 'question_text';
        return ctx.reply(
          `✅ ${state.data.questionOrder}-savol saqlandi.\n\n` +
          `Keyingi savol matnini kiriting (yoki tugatish uchun "tugadi" deb yozing):`
        );
      }

      default:
        return next();
    }
  });
}

module.exports = registerQuestionsAdmin;
