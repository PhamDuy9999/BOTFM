const { load, save, getUser } = require("./database");
const { rollDice, getWinRate, shouldWin, formatCoin } = require("./utils");
const {
  createGameEmbed,
  createResultEmbed,
  createBetButtons
} = require("./embeds");
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require("discord.js");

let currentBets = {};
let countdown   = 30;
let interval    = null;
let messageRef  = null;   // Message object (channel.send → có thể edit)
let gameChannel = null;
let isStarting  = false;  // Mutex lock để tránh race condition
let isEnding    = false;  // Mutex lock cho endGame

const MIN_BET     = 1000;      // Tối thiểu 1.000 VNĐ
const MAX_BET     = 5000000;   // Tối đa 5.000.000 VNĐ
const PAYOUT_MAIN = 1.9;
const PAYOUT_NUM  = 5;

exports.MIN_BET = MIN_BET;
exports.MAX_BET = MAX_BET;

/**
 * Lấy danh sách cược hiện tại (cho lệnh /xem)
 */
exports.getCurrentBets = () => {
  return { ...currentBets }; // Return copy để tránh modify
};

/**
 * Kiểm tra phiên có đang chạy không
 */
exports.isGameRunning = () => {
  const data = load();
  return data.gameRunning;
};

/**
 * Thêm bet từ slash command /dat
 */
exports.addBet = (userId, betType, betAmount) => {
  try {
    currentBets[userId] = { type: betType, amount: betAmount };
    return true;
  } catch (err) {
    console.error("❌ Lỗi addBet:", err);
    return false;
  }
};

/**
 * Bắt đầu phiên mới khi user gõ /cuoc
 */
exports.startGame = async (client, interaction) => {
  // Mutex lock để tránh spam /cuoc
  if (isStarting) {
    return interaction.reply({
      content: "⏳ Phiên đang được tạo, vui lòng chờ một chút...",
      flags: MessageFlags.Ephemeral
    });
  }

  const data = load();

  if (data.gameRunning) {
    return interaction.reply({
      content: "⚠️ Đã có phiên đang chạy! Chờ kết thúc rồi dùng lại `/cuoc`.",
      flags: MessageFlags.Ephemeral
    });
  }

  // Defer reply để tránh timeout 3s
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  isStarting = true;
  currentBets  = {};
  countdown    = 30;
  gameChannel  = interaction.channel;
  data.gameRunning = true;
  save(data);

  // Edit deferred reply
  await interaction.editReply({ content: "🎲 Đang mở phiên..." });

  // Gửi message chính ra channel — dùng channel.send để bot có thể edit sau
  const betStats = { taiCount: 0, xiuCount: 0, numCount: 0, taiAmount: 0, xiuAmount: 0, numAmount: 0 };
  const embed = createGameEmbed(data.round, countdown, 0, 0, betStats);
  
  try {
    messageRef = await gameChannel.send({
      embeds: [embed],
      components: createBetButtons()
    });
  } catch (err) {
    console.error("❌ Lỗi tạo message game:", err.message);
    data.gameRunning = false;
    save(data);
    isStarting = false;
    return interaction.editReply({ content: "❌ Lỗi tạo phiên game!" });
  }

  isStarting = false;

  interval = setInterval(async () => {
    countdown--;

    // Tính thống kê TÀI/XỈU/SỐ
    const taiCount = Object.values(currentBets).filter(b => b.type === "tai").length;
    const xiuCount = Object.values(currentBets).filter(b => b.type === "xiu").length;
    const numCount = Object.values(currentBets).filter(b => b.type.startsWith("num_")).length;
    
    const taiAmount = Object.values(currentBets).filter(b => b.type === "tai").reduce((s, b) => s + b.amount, 0);
    const xiuAmount = Object.values(currentBets).filter(b => b.type === "xiu").reduce((s, b) => s + b.amount, 0);
    const numAmount = Object.values(currentBets).filter(b => b.type.startsWith("num_")).reduce((s, b) => s + b.amount, 0);

    const totalPot  = Object.values(currentBets).reduce((s, b) => s + b.amount, 0);
    const betsCount = Object.keys(currentBets).length;
    
    const betStats = {
      taiCount, xiuCount, numCount,
      taiAmount, xiuAmount, numAmount
    };
    
    const updatedEmbed = createGameEmbed(data.round, countdown, betsCount, totalPot, betStats);

    try {
      await messageRef.edit({
        embeds: [updatedEmbed],
        components: countdown > 0 ? createBetButtons() : []
      });
    } catch (err) {
      console.error("❌ Lỗi edit message:", err.message);
    }

    if (countdown <= 0) {
      clearInterval(interval);
      interval = null;
      await endGame(client);
    }
  }, 1000);
};

/**
 * Kết thúc phiên, tính kết quả
 */
async function endGame(client) {
  // Mutex lock để tránh gọi endGame nhiều lần
  if (isEnding) {
    console.log("⚠️ endGame đang chạy, bỏ qua lần gọi này");
    return;
  }
  isEnding = true;

  const data = load();

  const taiPool = Object.values(currentBets).filter(b => b.type === "tai").reduce((s,b) => s+b.amount, 0);
  const xiuPool = Object.values(currentBets).filter(b => b.type === "xiu").reduce((s,b) => s+b.amount, 0);

  const result  = rollDice();
  const winners = [];
  const losers  = [];

  for (const [userId, bet] of Object.entries(currentBets)) {
    const userData       = getUser(data, userId);
    const vipMulti       = data.vip[userId] || 1;
    const winRateOverride = data.winRateOverrides?.[userId] ?? null;

    let win    = false;
    let reward = 0;

    if (bet.type === "tai" || bet.type === "xiu") {
      // Nếu có override winRate → dùng xác suất để quyết định thay vì kết quả thực
      if (winRateOverride !== null) {
        win = shouldWin(winRateOverride);
      } else {
        // Không có override → dùng kết quả thật
        win = bet.type === result.type;
      }
    } else if (bet.type.startsWith("num_")) {
      const num = parseInt(bet.type.split("_")[1]);
      win = result.dice.includes(num);
    }

    if (win) {
      const multiplier = bet.type.startsWith("num_") ? PAYOUT_NUM : PAYOUT_MAIN;
      reward = Math.floor(bet.amount * multiplier * vipMulti);
      userData.coin += reward;
      userData.totalWin = (userData.totalWin || 0) + 1;
      winners.push({ id: userId, reward });
    } else {
      userData.coin = Math.max(0, userData.coin - bet.amount);
      userData.totalLose = (userData.totalLose || 0) + 1;
      losers.push({ id: userId, amount: bet.amount });
    }

    userData.totalBet = (userData.totalBet || 0) + bet.amount;
    data.users[userId] = userData;
  }

  data.history.push({
    round: data.round,
    result: result.type,
    dice: result.dice,
    total: result.total,
    timestamp: Date.now(),
    betsCount: Object.keys(currentBets).length
  });
  if (data.history.length > 100) data.history.shift();

  data.round++;
  data.gameRunning = false;
  save(data);

  const resultEmbed = createResultEmbed(data.round - 1, result, winners, losers, taiPool + xiuPool);

  try {
    await gameChannel.send({ embeds: [resultEmbed] });
  } catch (err) {
    console.error("❌ Lỗi gửi kết quả:", err.message);
  }

  currentBets = {};
  messageRef  = null;
  isEnding    = false; // Release lock
}

/**
 * Xử lý khi user bấm nút cược
 */
exports.handleBet = async (interaction) => {
  const data = load();

  if (!data.gameRunning) {
    return interaction.reply({
      content: "❌ Không có phiên nào đang chạy! Dùng `/cuoc` để bắt đầu.",
      flags: MessageFlags.Ephemeral
    });
  }

  const customId = interaction.customId;

  // ═══════════════════════════════════════════════════
  // XỬ LÝ NÚT "NHẬP SỐ TIỀN TỰ DO"
  // ═══════════════════════════════════════════════════
  if (customId === "bet_custom_tai" || customId === "bet_custom_xiu" || customId === "bet_custom_num") {
    const betTypeLabel = 
      customId === "bet_custom_tai" ? "TÀI" :
      customId === "bet_custom_xiu" ? "XỈU" : "SỐ (1-6)";

    const modal = new ModalBuilder()
      .setCustomId(`modal_${customId}`)
      .setTitle(`💰 Đặt Cược ${betTypeLabel}`);

    const amountInput = new TextInputBuilder()
      .setCustomId("amount")
      .setLabel("Số tiền cược (VNĐ)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(`Từ ${formatCoin(MIN_BET)} đến ${formatCoin(MAX_BET)} VNĐ`)
      .setRequired(true)
      .setMinLength(5)
      .setMaxLength(10);

    const row = new ActionRowBuilder().addComponents(amountInput);

    // Nếu đặt số, thêm input cho số (1-6)
    if (customId === "bet_custom_num") {
      const numberInput = new TextInputBuilder()
        .setCustomId("number")
        .setLabel("Chọn số (1-6)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Nhập 1, 2, 3, 4, 5 hoặc 6")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(1);

      const row2 = new ActionRowBuilder().addComponents(numberInput);
      modal.addComponents(row, row2);
    } else {
      modal.addComponents(row);
    }

    return interaction.showModal(modal);
  }

  // ═══════════════════════════════════════════════════
  // XỬ LÝ NÚT CỐ ĐỊNH (50K, 100K, 500K, 5M)
  // ═══════════════════════════════════════════════════
  // customId: "bet_tai_100000" | "bet_num_3_50000"
  const parts = customId.split("_");
  let betType, betAmount;

  if (parts[1] === "num") {
    betType   = `num_${parts[2]}`;
    betAmount = parseInt(parts[3]);
  } else {
    betType   = parts[1];
    betAmount = parseInt(parts[2]);
  }

  if (isNaN(betAmount) || betAmount < MIN_BET || betAmount > MAX_BET) {
    return interaction.reply({
      content: `❌ Số tiền cược không hợp lệ! (${formatCoin(MIN_BET)}–${formatCoin(MAX_BET)} VNĐ)`,
      flags: MessageFlags.Ephemeral
    });
  }

  const userData = getUser(data, interaction.user.id);
  if (userData.coin < betAmount) {
    return interaction.reply({
      content: `❌ Không đủ tiền! Bạn chỉ có **${formatCoin(userData.coin)} VNĐ**`,
      flags: MessageFlags.Ephemeral
    });
  }

  const alreadyBet = !!currentBets[interaction.user.id];
  currentBets[interaction.user.id] = { type: betType, amount: betAmount };
  save(data);

  const typeLabel =
    betType === "tai" ? "🔴 TÀI" :
    betType === "xiu" ? "🔵 XỈU" :
    `🎯 Số ${betType.split("_")[1]}`;

  return interaction.reply({
    content: `✅ ${alreadyBet ? "Cập nhật cược:" : "Đã cược:"} **${typeLabel}** — **${formatCoin(betAmount)} VNĐ**\n⏳ Còn **${countdown}s** nữa`,
    flags: MessageFlags.Ephemeral
  });
};

/**
 * Xử lý Modal Submit - Nhập số tiền tự do
 */
exports.handleModalBet = async (interaction) => {
  const data = load();

  if (!data.gameRunning) {
    return interaction.reply({
      content: "❌ Phiên đã kết thúc! Dùng `/cuoc` để bắt đầu phiên mới.",
      flags: MessageFlags.Ephemeral
    });
  }

  const customId = interaction.customId; // "modal_bet_custom_tai" | "modal_bet_custom_xiu" | "modal_bet_custom_num"
  const amountStr = interaction.fields.getTextInputValue("amount");

  // Parse số tiền - Loại bỏ dấu chấm, dấu phẩy
  let betAmount = parseInt(amountStr.replace(/[.,\s]/g, ""));

  if (isNaN(betAmount) || betAmount < MIN_BET || betAmount > MAX_BET) {
    return interaction.reply({
      content: `❌ Số tiền không hợp lệ! Vui lòng nhập từ **${formatCoin(MIN_BET)}** đến **${formatCoin(MAX_BET)} VNĐ**`,
      flags: MessageFlags.Ephemeral
    });
  }

  const userData = getUser(data, interaction.user.id);
  if (userData.coin < betAmount) {
    return interaction.reply({
      content: `❌ Không đủ tiền! Bạn chỉ có **${formatCoin(userData.coin)} VNĐ**`,
      flags: MessageFlags.Ephemeral
    });
  }

  let betType;
  let typeLabel;

  if (customId === "modal_bet_custom_tai") {
    betType = "tai";
    typeLabel = "🔴 TÀI";
  } else if (customId === "modal_bet_custom_xiu") {
    betType = "xiu";
    typeLabel = "🔵 XỈU";
  } else if (customId === "modal_bet_custom_num") {
    const numberStr = interaction.fields.getTextInputValue("number");
    const num = parseInt(numberStr);

    if (isNaN(num) || num < 1 || num > 6) {
      return interaction.reply({
        content: "❌ Số không hợp lệ! Vui lòng nhập từ **1** đến **6**",
        flags: MessageFlags.Ephemeral
      });
    }

    betType = `num_${num}`;
    typeLabel = `🎯 Số ${num}`;
  }

  const alreadyBet = !!currentBets[interaction.user.id];
  currentBets[interaction.user.id] = { type: betType, amount: betAmount };
  save(data);

  return interaction.reply({
    content: `✅ ${alreadyBet ? "Cập nhật cược:" : "Đã cược:"} **${typeLabel}** — **${formatCoin(betAmount)} VNĐ**\n⏳ Còn **${countdown}s** nữa`,
    flags: MessageFlags.Ephemeral
  });
};

/**
 * Cleanup function - Gọi khi bot shutdown
 */
exports.cleanup = () => {
  console.log("🧹 Cleaning up game state...");
  
  if (interval) {
    clearInterval(interval);
    interval = null;
    console.log("  ✓ Cleared countdown interval");
  }
  
  currentBets = {};
  messageRef = null;
  gameChannel = null;
  isStarting = false;
  isEnding = false;
  
  console.log("  ✓ Reset game variables");
};
