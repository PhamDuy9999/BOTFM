const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { formatCoin, progressBar } = require("./utils");

const COLORS = {
  gold:   0xFFD700,
  green:  0x2ECC71,
  red:    0xE74C3C,
  blue:   0x3498DB,
  purple: 0x9B59B6,
  dark:   0x2C2F33,
  orange: 0xE67E22,
  teal:   0x1ABC9C,
};

const DICE_EMOJI = ["⚀","⚁","⚂","⚃","⚄","⚅"];

// ──────────────────────────────────────────────────────
// Embed phiên đang chạy (cập nhật mỗi giây)
// ──────────────────────────────────────────────────────
exports.createGameEmbed = (round, countdown, betsCount, totalPot, betStats = {}) => {
  const barLen = 20;
  const filled = Math.round(((30 - countdown) / 30) * barLen);
  const bar    = "▰".repeat(Math.max(0, filled)) + "▱".repeat(Math.max(0, barLen - filled));
  const urgency = countdown <= 10 ? "🔴" : countdown <= 20 ? "🟡" : "🟢";

  // Status text dựa vào số người chơi
  let statusText = "";
  if (betsCount === 0) {
    statusText = "⏳ Chờ người chơi...";
  } else if (betsCount === 1) {
    statusText = "👤 **1 người** đang chơi";
  } else {
    statusText = `👥 **${betsCount} người** đang chơi`;
  }

  // Thống kê TÀI/XỈU/SỐ
  const { taiCount = 0, xiuCount = 0, numCount = 0, taiAmount = 0, xiuAmount = 0, numAmount = 0 } = betStats;
  
  let statsText = "";
  if (betsCount > 0) {
    statsText = "\n**📊 Thống kê cược:**\n";
    if (taiCount > 0) {
      statsText += `> 🔴 **TÀI:** ${taiCount} người • ${formatCoin(taiAmount)} VNĐ\n`;
    }
    if (xiuCount > 0) {
      statsText += `> 🔵 **XỈU:** ${xiuCount} người • ${formatCoin(xiuAmount)} VNĐ\n`;
    }
    if (numCount > 0) {
      statsText += `> 🎯 **SỐ:** ${numCount} người • ${formatCoin(numAmount)} VNĐ\n`;
    }
  }

  return new EmbedBuilder()
    .setColor(COLORS.gold)
    .setTitle("╔══════════════════════╗\n        🎲  TÀI XỈU  🎲\n╚══════════════════════╝")
    .setDescription(
      `\`\`\`\n  Phiên #${round}  •  Cược đang mở\n\`\`\`` +
      `\n${urgency} **${bar}** \`${countdown}s\`\n\n` +
      `${statusText}\n` +
      `💰 Tổng pool: **${formatCoin(totalPot)} VNĐ**\n` +
      `${statsText}`
    )
    .addFields({
      name: "📘 Luật chơi",
      value:
        "> 🔴 **TÀI** = Tổng **11–18**  →  Thắng **×1.9**\n" +
        "> 🔵 **XỈU** = Tổng **3–10**   →  Thắng **×1.9**\n" +
        "> 🎯 **Đặt số** (1–6)           →  Thắng **×5**\n" +
        "> 💸 Min: **1K** • Max: **5M** • Nhiều người cùng chơi được!",
      inline: false
    })
    .setFooter({ text: "⚡ Đặt cược ngay • Bot Tài Xỉu v2.0 • Multiplayer" })
    .setTimestamp();
};

// ──────────────────────────────────────────────────────
// Embed kết quả phiên
// ──────────────────────────────────────────────────────
exports.createResultEmbed = (round, result, winners, losers, totalPot) => {
  const diceDisplay = result.dice.map(d => DICE_EMOJI[d - 1]).join("  ");
  const isTai = result.type === "tai";

  const totalPlayers = winners.length + losers.length;
  const winPercent = totalPlayers > 0 ? Math.round((winners.length / totalPlayers) * 100) : 0;

  // Top 5 winners
  const winnerList = winners.length
    ? winners.slice(0, 5).map((w, i) => {
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏆";
        return `> ${medal} <@${w.id}> **+${formatCoin(w.reward)} VNĐ**`;
      }).join("\n") + (winners.length > 5 ? `\n> ... và **${winners.length - 5}** người nữa` : "")
    : "> Không có người thắng 😢";

  // Summary losers (không list tên, chỉ tổng)
  const totalLost = losers.reduce((sum, l) => sum + l.amount, 0);

  const embed = new EmbedBuilder()
    .setColor(isTai ? COLORS.red : COLORS.blue)
    .setTitle(`${isTai ? "🔴" : "🔵"} KẾT QUẢ PHIÊN #${round}`)
    .setDescription(
      `\`\`\`\n  ${diceDisplay}\n\`\`\`` +
      `\n📊 Tổng điểm: **${result.total}**  →  **${result.type.toUpperCase()}** ${isTai ? "🔴" : "🔵"}\n\n` +
      `👥 **Thống kê:**\n` +
      `• Tổng người chơi: **${totalPlayers}** người\n` +
      `• Thắng: **${winners.length}** người (${winPercent}%)\n` +
      `• Thua: **${losers.length}** người\n` +
      `• Tổng pool: **${formatCoin(totalPot)} VNĐ**\n` +
      `• Tổng mất: **${formatCoin(totalLost)} VNĐ**\n\n` +
      `🏆 **Top Thắng Lớn:**\n${winnerList}`
    )
    .setFooter({ text: `Phiên #${round} kết thúc • Dùng /cuoc để chơi lại • Multiplayer` })
    .setTimestamp();

  return embed;
};

// ──────────────────────────────────────────────────────
// Embed thống kê (text fallback nếu chart lỗi)
// ──────────────────────────────────────────────────────
exports.createStatsEmbed = (history, round) => {
  const last20   = history.slice(-20);
  const taiCount = last20.filter(h => h.result === "tai").length;
  const xiuCount = last20.length - taiCount;

  return new EmbedBuilder()
    .setColor(COLORS.purple)
    .setTitle("📊  THỐNG KÊ TÀI XỈU")
    .setDescription(`Phiên hiện tại: **#${round}**  •  Đã chơi: **${history.length}** phiên`)
    .addFields({
      name: "20 phiên gần nhất",
      value:
        `🔴 TÀI: **${taiCount}** lần\n` +
        `🔵 XỈU: **${xiuCount}** lần\n` +
        last20.map(h => h.result === "tai" ? "🔴" : "🔵").join(" "),
      inline: false
    })
    .setTimestamp();
};

// ──────────────────────────────────────────────────────
// Embed hồ sơ cá nhân
// ──────────────────────────────────────────────────────
exports.createProfileEmbed = (user, userId, userData, vipMulti, winRateOverride) => {
  const { coin, totalBet = 0, totalWin = 0, totalLose = 0 } = userData;
  const games   = totalWin + totalLose;
  const winRate = games > 0 ? Math.round((totalWin / games) * 100) : 0;

  const tier =
    coin >= 1_000_000_000 ? "💎 Diamond" :
    coin >= 500_000_000   ? "🥇 Gold" :
    coin >= 100_000_000   ? "🥈 Silver" :
    "🥉 Bronze";

  return new EmbedBuilder()
    .setColor(COLORS.teal)
    .setTitle(`👤 Hồ sơ: ${user.username}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: "💵 Số dư",       value: `**${formatCoin(coin)} VNĐ**`, inline: true },
      { name: "🏅 Hạng",        value: tier, inline: true },
      { name: "⚡ VIP",         value: vipMulti > 1 ? `×${vipMulti}` : "Không", inline: true },
      { name: "📊 Tổng cược",   value: `**${formatCoin(totalBet)} VNĐ**`, inline: true },
      { name: "🏆 Thắng",       value: `**${totalWin}** lần`, inline: true },
      { name: "💸 Thua",        value: `**${totalLose}** lần`, inline: true },
      {
        name: "📈 Tỉ lệ thắng",
        value: `${progressBar(winRate, 100, 12)} **${winRate}%**`,
        inline: false
      },
      ...(winRateOverride !== null && winRateOverride !== undefined
        ? [{ name: "🎯 Tỉ lệ đặc biệt (Admin)", value: `${Math.round(winRateOverride * 100)}%`, inline: true }]
        : [])
    )
    .setFooter({ text: "Bot Tài Xỉu v2.0" })
    .setTimestamp();
};

// ──────────────────────────────────────────────────────
// Embed help (không có lệnh admin)
// ──────────────────────────────────────────────────────
exports.createHelpEmbed = () => {
  return new EmbedBuilder()
    .setColor(COLORS.gold)
    .setTitle("📖  HƯỚNG DẪN CHƠI TÀI XỈU")
    .setDescription("Bot tài xỉu 3 xúc xắc — Đơn giản, vui vẻ, **NHIỀU NGƯỜI CÙNG CHƠI**! 🎊")
    .addFields(
      {
        name: "🎮 Lệnh Cơ Bản",
        value:
          "`/cuoc` — Bắt đầu phiên mới\n" +
          "`/dat` — Đặt cược nhanh với lệnh\n" +
          "`/xem` — Xem ai đang cược 👀\n" +
          "`/coin` — Xem số dư\n" +
          "`/stats` — Biểu đồ lịch sử\n" +
          "`/profile` — Xem hồ sơ\n" +
          "`/top` — Bảng xếp hạng\n" +
          "`/help` — Hướng dẫn này",
        inline: false
      },
      {
        name: "🎲 Cách Đặt Cược",
        value:
          "**Cách 1: Bấm nút nhanh**\n" +
          "Sau khi `/cuoc`, bấm nút 1K-5M\n\n" +
          "**Cách 2: Nhập số tiền** ✍️\n" +
          "Bấm nút xanh → Nhập số tiền tùy ý\n\n" +
          "**Cách 3: Dùng lệnh**\n" +
          "`/dat loai:TÀI sotien:2500`",
        inline: false
      },
      {
        name: "👥 Chơi Multiplayer",
        value:
          "• **Không giới hạn** số người chơi!\n" +
          "• Mỗi người cược 1 lần/phiên\n" +
          "• Dùng `/xem` để thấy ai đang cược gì\n" +
          "• Tất cả cùng đợi kết quả chung",
        inline: false
      },
      {
        name: "🏆 Tỉ Lệ Thưởng",
        value:
          "🔴 **TÀI** (≥11) → **×1.9**\n" +
          "🔵 **XỈU** (≤10) → **×1.9**\n" +
          "🎯 **Số 1-6** → **×5**",
        inline: false
      },
      {
        name: "💵 Giới Hạn Cược",
        value:
          "• Tối thiểu: **1.000 VNĐ**\n" +
          "• Tối đa: **5.000.000 VNĐ**\n" +
          "• Có thể update cược trước khi hết giờ",
        inline: false
      },
      {
        name: "💡 Mẹo",
        value:
          "• `/xem` để xem chiến lược người khác\n" +
          "• `/stats` xem xu hướng TÀI/XỈU\n" +
          "• Rủ bạn bè cùng chơi!",
        inline: false
      }
    )
    .setFooter({ text: "Bot Tài Xỉu v2.0 • Multiplayer Mode • Chơi vui vẻ!" });
};

// ──────────────────────────────────────────────────────
// Embed top
// ──────────────────────────────────────────────────────
exports.createTopEmbed = (topUsers) => {
  const medals = ["🥇","🥈","🥉","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
  const list = topUsers.map((u, i) =>
    `${medals[i] || `**${i+1}.**`} <@${u.id}> — **${formatCoin(u.coin)} VNĐ**`
  ).join("\n");

  return new EmbedBuilder()
    .setColor(COLORS.gold)
    .setTitle("🏆  BẢNG XẾP HẠNG")
    .setDescription(list || "Chưa có dữ liệu")
    .setFooter({ text: "Top 10 người giàu nhất" })
    .setTimestamp();
};

// ──────────────────────────────────────────────────────
// Nút cược — mệnh giá VNĐ + nút nhập tự do
// ──────────────────────────────────────────────────────
exports.createBetButtons = () => {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("bet_tai_1000").setLabel("🔴 TÀI  1K").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("bet_tai_5000").setLabel("🔴 TÀI  5K").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("bet_tai_10000").setLabel("🔴 TÀI  10K").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("bet_tai_50000").setLabel("🔴 TÀI  50K").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("bet_tai_100000").setLabel("🔴 TÀI  100K").setStyle(ButtonStyle.Danger),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("bet_xiu_1000").setLabel("🔵 XỈU  1K").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("bet_xiu_5000").setLabel("🔵 XỈU  5K").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("bet_xiu_10000").setLabel("🔵 XỈU  10K").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("bet_xiu_50000").setLabel("🔵 XỈU  50K").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("bet_xiu_100000").setLabel("🔵 XỈU  100K").setStyle(ButtonStyle.Primary),
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("bet_num_1_1000").setLabel("🎯 Số 1").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("bet_num_2_1000").setLabel("🎯 Số 2").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("bet_num_3_1000").setLabel("🎯 Số 3").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("bet_num_4_1000").setLabel("🎯 Số 4").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("bet_num_5_1000").setLabel("🎯 Số 5").setStyle(ButtonStyle.Secondary),
  );

  // ROW 4: Số 6 + nút MAX + nhập tự do
  const row4 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("bet_num_6_1000").setLabel("🎯 Số 6").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("bet_tai_5000000").setLabel("🔴 MAX 5M").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("bet_xiu_5000000").setLabel("🔵 MAX 5M").setStyle(ButtonStyle.Primary),
  );

  // ROW 5: Nút "Nhập số tiền tự do"
  const row5 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("bet_custom_tai")
      .setLabel("💰 TÀI - Nhập Số Tiền")
      .setStyle(ButtonStyle.Success)
      .setEmoji("✍️"),
    new ButtonBuilder()
      .setCustomId("bet_custom_xiu")
      .setLabel("💰 XỈU - Nhập Số Tiền")
      .setStyle(ButtonStyle.Success)
      .setEmoji("✍️"),
    new ButtonBuilder()
      .setCustomId("bet_custom_num")
      .setLabel("🎯 SỐ - Nhập Số Tiền")
      .setStyle(ButtonStyle.Success)
      .setEmoji("✍️")
  );

  return [row1, row2, row3, row4, row5];
};

exports.COLORS = COLORS;
