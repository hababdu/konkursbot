const sequelize = require('./connection');
require('./models'); // barcha modellarni ro'yxatdan o'tkazish uchun import qilinadi

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Ma\'lumotlar bazasi jadvallari muvaffaqiyatli yaratildi/yangilandi.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Bazani sinxronlashda xatolik:', err);
    process.exit(1);
  }
})();
