const { Telegraf } = require('telegraf');
const config = require('../config/config');

const checkSubscriptionMiddleware = require('./middlewares/checkSubscription');

const registerStartHandler = require('./handlers/start');
const registerCheckSubscriptionAction = require('./handlers/checkSubscriptionAction');
const registerQuizHandlers = require('./handlers/quiz');
const registerRatingHandler = require('./handlers/rating');
const registerReferralHandler = require('./handlers/referral');
const registerProfileHandler = require('./handlers/profile');

const registerAdminEntry = require('./admin/admin');
const registerChannelsAdmin = require('./admin/channels');
const registerContestsAdmin = require('./admin/contests');
const registerQuestionsAdmin = require('./admin/questions');
const registerFinishContestAdmin = require('./admin/finishContest');
const registerStatsAdmin = require('./admin/stats');
const registerBroadcastAdmin = require('./admin/broadcast');

function createBot() {
  const bot = new Telegraf(config.botToken);

  // 1) /start har doim ochiq (obuna tekshiruvidan mustasno)
  registerStartHandler(bot);
  registerCheckSubscriptionAction(bot);

  // 2) Admin buyruqlari (obuna tekshiruvidan mustasno bo'lishi kerak bo'lgani uchun
  //    middleware'dan OLDIN ro'yxatdan o'tkazamiz)
  registerAdminEntry(bot);
  registerChannelsAdmin(bot);
  registerContestsAdmin(bot);
  registerQuestionsAdmin(bot);
  registerFinishContestAdmin(bot);
  registerStatsAdmin(bot);
  registerBroadcastAdmin(bot);

  // 3) Oddiy foydalanuvchi funksiyalaridan oldin majburiy obunani tekshiramiz
  bot.use(checkSubscriptionMiddleware);

  registerQuizHandlers(bot);
  registerRatingHandler(bot);
  registerReferralHandler(bot);
  registerProfileHandler(bot);

  bot.catch((err, ctx) => {
    console.error(`Xatolik yuz berdi (${ctx.updateType}):`, err);
  });

  return bot;
}

module.exports = createBot;
