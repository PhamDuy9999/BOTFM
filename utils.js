/**
 * Tung 3 xúc xắc
 */
exports.rollDice = (forceResult = null) => {
  const dice  = [1,2,3].map(() => Math.floor(Math.random() * 6) + 1);
  const total = dice.reduce((a, b) => a + b, 0);
  const type  = forceResult || (total >= 11 ? "tai" : "xiu");
  return { dice, total, type };
};

/**
 * Format số tiền VNĐ có dấu chấm ngăn cách hàng nghìn
 * VD: 1000000 → "1.000.000"
 */
exports.formatCoin = (n) => {
  return Math.floor(Number(n)).toLocaleString("vi-VN");
};

/**
 * Progress bar ASCII
 */
exports.progressBar = (current, max, length = 10) => {
  const filled = max > 0 ? Math.round((current / max) * length) : 0;
  return "█".repeat(filled) + "░".repeat(length - filled);
};

/**
 * Tính winRate dựa trên số dư (càng giàu → tỉ lệ thắng thấp hơn)
 */
exports.getWinRate = (coin, override = null) => {
  if (override !== null) return override;
  if (coin >= 100_000_000) return 0.35;
  if (coin >= 50_000_000)  return 0.40;
  if (coin >= 20_000_000)  return 0.45;
  return 0.50;
};

exports.shouldWin = (winRate) => Math.random() < winRate;
