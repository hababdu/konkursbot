const http = require('http');
const sequelize = require('./database/connection');
require('./database/models'); // modellarni ro'yxatdan o'tkazish

const createBot = require('./bot/bot');

// Render (va shunga o'xshash Web Service hostinglar) portga ulanishni kutadi,
// aks holda deploy'ni "ishlamayapti" deb hisoblaydi. Bot o'zi long polling
// orqali ishlagani uchun HTTP so'rovlarga ehtiyoj yo'q, lekin shunchaki
// "tirikligimizni" bildirish uchun minimal server ochib qo'yamiz.
function startHealthCheckServer() {
  const port = process.env.PORT || 3000;
  http
    .createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Bot ishlayapti ✅');
    })
    .listen(port, () => {
      console.log(`🌐 Health-check server ${port}-portda ishga tushdi.`);
    });
}

async function main() {
  try {
    startHealthCheckServer();

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
