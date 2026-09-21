const sequelize = require('./database/connection');
require('./database/models'); // modellarni ro'yxatdan o'tkazish

const createBot = require('./bot/bot');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Ma\'lumotlar bazasiga ulanish muvaffaqiyatli.');

    // Ishlab chiqish (development) uchun; production'da migrate.js orqali boshqarish tavsiya etiladi
    await sequelize.sync();

    const bot = createBot();
    await bot.launch();
    console.log('🤖 Bot muvaffaqiyatli ishga tushdi.');

    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (err) {
    console.error('❌ Botni ishga tushirishda xatolik:', err);
    process.exit(1);
  }
}

main();
