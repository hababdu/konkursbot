const { Markup } = require('telegraf');
const { Book, Question, UserQuizAttempt, UserAnswer, User } = require('../../database/models');
const { getActiveContest } = require('../../services/contestService');
const { recalculateTotalPoints } = require('../../services/scoreService');

// Foydalanuvchining test jarayonidagi joriy holatini xotirada saqlash uchun
// (kichik loyihalar uchun yetarli; katta loyihada Redis/DB session tavsiya etiladi)
const activeSessions = new Map(); // key: telegramId, value: { bookId, questions, currentIndex }

function registerQuizHandlers(bot) {
  // "📚 Testni boshlash" tugmasi
  bot.hears('📚 Testni boshlash', async (ctx) => {
    const contest = await getActiveContest();
    if (!contest) {
      return ctx.reply('Hozircha faol konkurs mavjud emas.');
    }

    const books = await Book.findAll({ where: { contestId: contest.id } });
    if (books.length === 0) {
      return ctx.reply('Hozircha testlar qo\'shilmagan.');
    }

    const buttons = books.map((b) => [Markup.button.callback(`📖 ${b.title}`, `select_book_${b.id}`)]);
    await ctx.reply('Qaysi kitob bo\'yicha test ishlamoqchisiz?', Markup.inlineKeyboard(buttons));
  });

  // Kitob tanlanganda
  bot.action(/select_book_(\d+)/, async (ctx) => {
    const bookId = Number(ctx.match[1]);
    const userId = ctx.from.id;

    const existingAttempt = await UserQuizAttempt.findOne({ where: { userId, bookId } });
    if (existingAttempt) {
      await ctx.answerCbQuery();
      return ctx.reply('❗️ Siz bu testni allaqachon ishlagansiz. Har bir test faqat bir marta ishlanadi.');
    }

    const questions = await Question.findAll({ where: { bookId }, order: [['order', 'ASC']] });
    if (questions.length === 0) {
      await ctx.answerCbQuery();
      return ctx.reply('Bu kitob uchun hali savollar qo\'shilmagan.');
    }

    await UserQuizAttempt.create({ userId, bookId, status: 'in_progress' });

    activeSessions.set(userId, { bookId, questions, currentIndex: 0 });

    await ctx.answerCbQuery();
    await sendQuestion(ctx, userId);
  });

  // Javob tanlanganda
  bot.action(/answer_(\d+)/, async (ctx) => {
    const userId = ctx.from.id;
    const session = activeSessions.get(userId);
    if (!session) {
      await ctx.answerCbQuery();
      return;
    }

    const selectedIndex = Number(ctx.match[1]);
    const question = session.questions[session.currentIndex];
    const isCorrect = selectedIndex === question.correctOptionIndex;
    const earnedPoints = isCorrect ? question.points : 0;

    await UserAnswer.create({
      userId,
      questionId: question.id,
      selectedOptionIndex: selectedIndex,
      isCorrect,
      earnedPoints,
    });

    await ctx.answerCbQuery(isCorrect ? '✅ To\'g\'ri!' : '❌ Noto\'g\'ri!');

    session.currentIndex += 1;

    if (session.currentIndex >= session.questions.length) {
      await finishQuiz(ctx, userId, session);
    } else {
      await sendQuestion(ctx, userId);
    }
  });
}

async function sendQuestion(ctx, userId) {
  const session = activeSessions.get(userId);
  const question = session.questions[session.currentIndex];

  const buttons = question.options.map((opt, idx) => [
    Markup.button.callback(opt, `answer_${idx}`),
  ]);

  await ctx.reply(
    `❓ Savol ${session.currentIndex + 1}/${session.questions.length}:\n\n${question.text}`,
    Markup.inlineKeyboard(buttons)
  );
}

async function finishQuiz(ctx, userId, session) {
  const attempt = await UserQuizAttempt.findOne({ where: { userId, bookId: session.bookId } });
  const answers = await UserAnswer.findAll({
    where: { userId },
    include: [{ model: Question, where: { bookId: session.bookId } }],
  });

  const totalEarned = answers.reduce((sum, a) => sum + a.earnedPoints, 0);

  attempt.status = 'completed';
  attempt.totalEarnedPoints = totalEarned;
  await attempt.save();

  const user = await User.findByPk(userId);
  user.quizPoints = (user.quizPoints || 0) + totalEarned;
  await user.save();
  await recalculateTotalPoints(userId);

  activeSessions.delete(userId);

  await ctx.reply(
    `🏁 Test yakunlandi!\n\nSiz ${totalEarned} ball to'pladingiz.\nUmumiy ballaringizni "Mening profilim" bo'limidan ko'rishingiz mumkin.`
  );
}

module.exports = registerQuizHandlers;
