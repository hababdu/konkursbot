const { Referral, User } = require('../database/models');
const { recalculateTotalPoints } = require('./scoreService');
const config = require('../config/config');

/**
 * Yangi foydalanuvchi referal havola orqali kirganda chaqiriladi.
 * Bu bosqichda hali ball berilmaydi - faqat referal yozuvi yaratiladi.
 */
async function registerReferral(referrerId, referredId) {
  if (referrerId === referredId) return null; // o'zini-o'zi referal qilishning oldini olish

  const existing = await Referral.findOne({ where: { referredId } });
  if (existing) return existing; // bu foydalanuvchi allaqachon kimningdir referali

  return Referral.create({ referrerId, referredId, isConfirmed: false });
}

/**
 * Foydalanuvchi majburiy obunani to'liq bajarganda chaqiriladi.
 * Agar u kimningdir referali bo'lsa va hali tasdiqlanmagan bo'lsa,
 * referal ball beriladi.
 */
async function confirmReferralIfExists(referredId) {
  const referral = await Referral.findOne({ where: { referredId, isConfirmed: false } });
  if (!referral) return null;

  // Oddiy soxta-akkount tekshiruvi (kengaytirilishi mumkin):
  // masalan referrer o'zi ham bloklanmagan va faol bo'lishi kerak
  const referrer = await User.findByPk(referral.referrerId);
  if (!referrer || referrer.isBlocked) {
    referral.isSuspicious = true;
    await referral.save();
    return null;
  }

  const points = config.scoring.defaultReferralPoints;

  referral.isConfirmed = true;
  referral.pointsAwarded = points;
  await referral.save();

  referrer.referralPoints = (referrer.referralPoints || 0) + points;
  await referrer.save();
  await recalculateTotalPoints(referrer.telegramId);

  return referral;
}

module.exports = { registerReferral, confirmReferralIfExists };
