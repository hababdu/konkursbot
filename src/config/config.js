require('dotenv').config();

module.exports = {
  botToken: process.env.BOT_TOKEN,
  botUsername: process.env.BOT_USERNAME,
  adminIds: (process.env.ADMIN_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .map(Number),

  db: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  // Umumiy ball formulasi: testBall + referalBall = umumiyBall
  scoring: {
    defaultReferralPoints: 5, // bitta tasdiqlangan referal uchun ball
  },
};
