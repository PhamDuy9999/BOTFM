require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, MessageFlags } = require("discord.js");
const { load, save, getUser } = require("./database");
const { startGame, handleBet, handleModalBet, getCurrentBets, isGameRunning } = require("./game");
const { formatCoin } = require("./utils");
const { generateStatsChart } = require("./chart");
const {
  createStatsEmbed,
  createProfileEmbed,
  createHelpEmbed,
  createTopEmbed,
  COLORS
} = require("./embeds");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const isAdmin = (member) => member?.permissions?.has("Administrator") ?? false;

// ──────────────────────────────────────────────────────
client.once("ready", () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
  client.user.setActivity("🎲 /cuoc để chơi Tài Xỉu", { type: 0 });
  
  // Reset game state nếu bot bị restart giữa phiên
  const data = load();
  if (data.gameRunning) {
    console.log("⚠️ Phát hiện phiên dang dở từ lần chạy trước, đang reset...");
    data.gameRunning = false;
    data.currentSession = null;
    save(data);
  }
});

// ──────────────────────────────────────────────────────
client.on("interactionCreate", async (interaction) => {
  try {

    // ── Nút bấm cược ──
    if (interaction.isButton()) {
      if (interaction.customId.startsWith("bet_")) {
        return await handleBet(interaction);
      }
      return;
    }

    // ── Modal Submit (nhập số tiền tự do) ──
    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith("modal_bet_custom_")) {
        return await handleModalBet(interaction);
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;
    const data = load();

    // ────────────────────────
    // /cuoc
    // ────────────────────────
    if (commandName === "cuoc") {
      return await startGame(client, interaction);
    }

    // ────────────────────────
    // /dat - Đặt cược bằng lệnh
    // ────────────────────────
    if (commandName === "dat") {
      if (!data.gameRunning) {
        return interaction.reply({
          content: "❌ Không có phiên nào đang chạy! Dùng `/cuoc` để bắt đầu.",
          flags: MessageFlags.Ephemeral
        });
      }

      const betTypeOption = interaction.options.getString("loai");
      const betAmount = interaction.options.getInteger("sotien");
      const userData = getUser(data, interaction.user.id);

      if (userData.coin < betAmount) {
        return interaction.reply({
          content: `❌ Không đủ tiền! Bạn chỉ có **${formatCoin(userData.coin)} VNĐ**`,
          flags: MessageFlags.Ephemeral
        });
      }

      // Import từ game.js để sử dụng currentBets
      const { addBet } = require("./game");
      const success = addBet(interaction.user.id, betTypeOption, betAmount);

      if (!success) {
        return interaction.reply({
          content: "❌ Có lỗi xảy ra khi đặt cược!",
          flags: MessageFlags.Ephemeral
        });
      }

      const typeLabel =
        betTypeOption === "tai" ? "🔴 TÀI" :
        betTypeOption === "xiu" ? "🔵 XỈU" :
        `🎯 Số ${betTypeOption.split("_")[1]}`;

      return interaction.reply({
        content: `✅ Đã cược **${typeLabel}** — **${formatCoin(betAmount)} VNĐ**\n⏳ Chờ kết quả...`,
        flags: MessageFlags.Ephemeral
      });
    }

    // ────────────────────────
    // /xem - Xem ai đang cược
    // ────────────────────────
    if (commandName === "xem") {
      if (!isGameRunning()) {
        return interaction.reply({
          content: "❌ Không có phiên nào đang chạy! Dùng `/cuoc` để bắt đầu.",
          flags: MessageFlags.Ephemeral
        });
      }

      const currentBets = getCurrentBets();
      const betsCount = Object.keys(currentBets).length;

      if (betsCount === 0) {
        return interaction.reply({
          content: "👀 Phiên đang chạy nhưng chưa có ai cược!",
          flags: MessageFlags.Ephemeral
        });
      }

      // Tổng hợp theo loại cược
      const taiList = [];
      const xiuList = [];
      const numList = [];
      let totalPot = 0;

      for (const [userId, bet] of Object.entries(currentBets)) {
        totalPot += bet.amount;
        const betInfo = `<@${userId}> - ${formatCoin(bet.amount)} VNĐ`;
        
        if (bet.type === "tai") {
          taiList.push(betInfo);
        } else if (bet.type === "xiu") {
          xiuList.push(betInfo);
        } else if (bet.type.startsWith("num_")) {
          const num = bet.type.split("_")[1];
          numList.push(`<@${userId}> - Số ${num} - ${formatCoin(bet.amount)} VNĐ`);
        }
      }

      const embed = new EmbedBuilder()
        .setColor(COLORS.blue)
        .setTitle("👀 DANH SÁCH CƯỢC HIỆN TẠI")
        .setDescription(
          `**Phiên #${data.round}** • **${betsCount} người** đang chơi\n` +
          `💰 Tổng pool: **${formatCoin(totalPot)} VNĐ**`
        )
        .setTimestamp();

      if (taiList.length > 0) {
        embed.addFields({
          name: `🔴 TÀI (${taiList.length} người)`,
          value: taiList.slice(0, 10).join("\n") + (taiList.length > 10 ? `\n... +${taiList.length - 10} người nữa` : ""),
          inline: false
        });
      }

      if (xiuList.length > 0) {
        embed.addFields({
          name: `🔵 XỈU (${xiuList.length} người)`,
          value: xiuList.slice(0, 10).join("\n") + (xiuList.length > 10 ? `\n... +${xiuList.length - 10} người nữa` : ""),
          inline: false
        });
      }

      if (numList.length > 0) {
        embed.addFields({
          name: `🎯 ĐẶT SỐ (${numList.length} người)`,
          value: numList.slice(0, 10).join("\n") + (numList.length > 10 ? `\n... +${numList.length - 10} người nữa` : ""),
          inline: false
        });
      }

      embed.setFooter({ text: "Cập nhật real-time • Mọi người đều thấy được" });

      return interaction.reply({ embeds: [embed] });
    }

    // ────────────────────────
    // /coin
    // ────────────────────────
    if (commandName === "coin") {
      const userData = getUser(data, interaction.user.id);
      save(data);
      return interaction.reply({
        content: `💵 **${interaction.user.username}**, số dư của bạn: **${formatCoin(userData.coin)} VNĐ**`,
        flags: MessageFlags.Ephemeral
      });
    }

    // ────────────────────────
    // /whoami — Xem thông tin và quyền admin
    // ────────────────────────
    if (commandName === "whoami") {
      const member = interaction.member;
      const user = interaction.user;
      const guild = interaction.guild;
      
      // Lấy danh sách roles (loại bỏ @everyone)
      const roles = member.roles.cache
        .filter(r => r.name !== "@everyone")
        .map(r => `\`${r.name}\``)
        .join(", ") || "Không có role";
      
      // Check các quyền
      const isOwner = guild.ownerId === user.id;
      const hasAdmin = member.permissions.has("Administrator");
      const isBotAdmin = isAdmin(member);
      
      // Lấy thông tin coin
      const userData = getUser(data, user.id);
      const vipMulti = data.vip?.[user.id] || 1;
      const winRateOvr = data.winRateOverrides?.[user.id] ?? null;
      save(data);

      const embed = new EmbedBuilder()
        .setColor(isBotAdmin ? 0xFF0000 : 0x3498DB)
        .setTitle(`🔍 Thông Tin: ${user.username}`)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: "🆔 User ID", value: user.id, inline: true },
          { name: "👤 Username", value: user.username, inline: true },
          { name: "📅 Tạo tài khoản", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: "👑 Server Owner", value: isOwner ? "✅ Có" : "❌ Không", inline: true },
          { name: "🛡️ Administrator", value: hasAdmin ? "✅ Có" : "❌ Không", inline: true },
          { name: "🤖 Bot Admin", value: isBotAdmin ? "✅ Có" : "❌ Không", inline: true },
          { name: "📜 Roles", value: roles, inline: false },
          { name: "💵 Số dư", value: `${formatCoin(userData.coin)} VNĐ`, inline: true },
          { name: "🎮 Tổng cược", value: `${formatCoin(userData.totalBet || 0)} VNĐ`, inline: true },
          { name: "⚡ VIP", value: vipMulti > 1 ? `×${vipMulti}` : "Không", inline: true }
        )
        .setTimestamp()
        .setFooter({ text: "Dùng /help để xem hướng dẫn" });
      
      if (winRateOvr !== null) {
        embed.addFields({
          name: "🎯 Tỉ lệ thắng đặc biệt",
          value: `${Math.round(winRateOvr * 100)}% (Admin đã set)`,
          inline: false
        });
      }

      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // ────────────────────────
    // /xemcoin — Admin xem coin của user khác
    // ────────────────────────
    if (commandName === "xemcoin") {
      if (!isAdmin(interaction.member))
        return interaction.reply({ content: "❌ Bạn không có quyền Admin!", flags: MessageFlags.Ephemeral });

      const targetUser = interaction.options.getUser("user");
      const userData = getUser(data, targetUser.id);
      const vipMulti = data.vip?.[targetUser.id] || 1;
      const winRateOvr = data.winRateOverrides?.[targetUser.id] ?? null;
      save(data);

      let info = `💵 **Số dư:** ${formatCoin(userData.coin)} VNĐ\n`;
      info += `🎮 **Tổng cược:** ${formatCoin(userData.totalBet || 0)} VNĐ\n`;
      info += `🏆 **Thắng:** ${userData.totalWin || 0} lần\n`;
      info += `💸 **Thua:** ${userData.totalLose || 0} lần\n`;
      info += `⚡ **VIP:** ${vipMulti > 1 ? `×${vipMulti}` : "Không"}\n`;
      if (winRateOvr !== null) {
        info += `🎯 **Tỉ lệ thắng đặc biệt:** ${Math.round(winRateOvr * 100)}%`;
      }

      return interaction.reply({
        content: `**[Admin] Thông tin ${targetUser.username}**\n${info}`,
        flags: MessageFlags.Ephemeral
      });
    }

    // ────────────────────────
    // /allusers — Admin xem tất cả users
    // ────────────────────────
    if (commandName === "allusers") {
      if (!isAdmin(interaction.member))
        return interaction.reply({ content: "❌ Bạn không có quyền Admin!", flags: MessageFlags.Ephemeral });

      const allUsers = Object.entries(data.users)
        .map(([id, u]) => ({ id, coin: u.coin || 0, totalBet: u.totalBet || 0 }))
        .sort((a, b) => b.coin - a.coin);

      if (allUsers.length === 0) {
        return interaction.reply({
          content: "📋 **[Admin] Chưa có user nào trong hệ thống**",
          flags: MessageFlags.Ephemeral
        });
      }

      const { EmbedBuilder } = require("discord.js");
      const embed = new EmbedBuilder()
        .setColor(0xFF6B00)
        .setTitle("🛡️ [Admin] Danh Sách Users")
        .setDescription(`Tổng: **${allUsers.length}** người`)
        .setTimestamp();

      const userList = allUsers.slice(0, 25).map((u, i) => {
        const vip = data.vip?.[u.id] ? ` ⚡×${data.vip[u.id]}` : "";
        const wr = data.winRateOverrides?.[u.id] ? ` 🎯${Math.round(data.winRateOverrides[u.id] * 100)}%` : "";
        return `**${i + 1}.** <@${u.id}>: **${formatCoin(u.coin)}** VNĐ${vip}${wr}`;
      }).join("\n");

      embed.addFields({
        name: `💰 Top ${Math.min(25, allUsers.length)} Users`,
        value: userList,
        inline: false
      });

      if (allUsers.length > 25) {
        embed.setFooter({ text: `Hiển thị 25/${allUsers.length} users` });
      }

      return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // ────────────────────────
    // /stats — biểu đồ ảnh
    // ────────────────────────
    if (commandName === "stats") {
      await interaction.deferReply();
      try {
        const attachment = generateStatsChart(data.history, data.round);
        return interaction.editReply({
          content: `📊 **Lịch sử ${Math.min(data.history.length, 20)} phiên gần nhất — Phiên hiện tại: #${data.round}**`,
          files: [attachment]
        });
      } catch (err) {
        console.error("❌ Lỗi tạo biểu đồ:", err);
        // Fallback về embed text nếu Python/Pillow không có
        const embed = createStatsEmbed(data.history, data.round);
        return interaction.editReply({ 
          content: "⚠️ Không thể tạo biểu đồ ảnh (thiếu Python/Pillow), hiển thị dạng text:",
          embeds: [embed] 
        });
      }
    }

    // ────────────────────────
    // /profile
    // ────────────────────────
    if (commandName === "profile") {
      const targetUser  = interaction.options.getUser("user") || interaction.user;
      const userData    = getUser(data, targetUser.id);
      const vipMulti    = data.vip?.[targetUser.id] || 1;
      const winRateOvr  = data.winRateOverrides?.[targetUser.id] ?? null;
      save(data);
      const embed = createProfileEmbed(targetUser, targetUser.id, userData, vipMulti, winRateOvr);
      return interaction.reply({ embeds: [embed] });
    }

    // ────────────────────────
    // /top
    // ────────────────────────
    if (commandName === "top") {
      const topUsers = Object.entries(data.users)
        .map(([id, u]) => ({ id, coin: u.coin || 0 }))
        .sort((a, b) => b.coin - a.coin)
        .slice(0, 10);
      const embed = createTopEmbed(topUsers);
      return interaction.reply({ embeds: [embed] });
    }

    // ────────────────────────
    // /help
    // ────────────────────────
    if (commandName === "help") {
      return interaction.reply({ embeds: [createHelpEmbed()], flags: MessageFlags.Ephemeral });
    }

    // ══════════════════════════════════
    // ADMIN COMMANDS
    // ══════════════════════════════════

    if (commandName === "setmoney") {
      if (!isAdmin(interaction.member))
        return interaction.reply({ content: "❌ Bạn không có quyền Admin!", flags: MessageFlags.Ephemeral });

      const user   = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");
      
      // Validation: Giới hạn max coin để tránh overflow
      const MAX_COIN = 10_000_000_000; // 10 tỷ VNĐ
      if (amount > MAX_COIN) {
        return interaction.reply({ 
          content: `⚠️ Số tiền quá lớn! Tối đa: **${formatCoin(MAX_COIN)} VNĐ**`, 
          flags: MessageFlags.Ephemeral 
        });
      }
      
      const ud     = getUser(data, user.id);
      ud.coin      = amount;
      data.users[user.id] = ud;
      save(data);
      return interaction.reply({ content: `💵 **[Admin]** Set **${formatCoin(amount)} VNĐ** cho ${user}`, flags: MessageFlags.Ephemeral });
    }

    if (commandName === "addcoin") {
      if (!isAdmin(interaction.member))
        return interaction.reply({ content: "❌ Bạn không có quyền Admin!", flags: MessageFlags.Ephemeral });

      const user   = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");
      const ud     = getUser(data, user.id);
      
      const newTotal = ud.coin + amount;
      const MAX_COIN = 10_000_000_000; // 10 tỷ VNĐ
      
      if (newTotal > MAX_COIN) {
        return interaction.reply({ 
          content: `⚠️ Tổng coin sẽ vượt quá giới hạn **${formatCoin(MAX_COIN)} VNĐ**!`, 
          flags: MessageFlags.Ephemeral 
        });
      }
      
      ud.coin     += amount;
      data.users[user.id] = ud;
      save(data);
      return interaction.reply({
        content: `💵 **[Admin]** Đã cộng **${formatCoin(amount)} VNĐ** cho ${user} (tổng: **${formatCoin(ud.coin)} VNĐ**)`,
        flags: MessageFlags.Ephemeral
      });
    }

    if (commandName === "setvip") {
      if (!isAdmin(interaction.member))
        return interaction.reply({ content: "❌ Bạn không có quyền Admin!", flags: MessageFlags.Ephemeral });

      const user  = interaction.options.getUser("user");
      const multi = interaction.options.getInteger("multi");
      if (!data.vip) data.vip = {};
      data.vip[user.id] = multi;
      save(data);
      return interaction.reply({ content: `💎 **[Admin]** Set VIP ×**${multi}** cho ${user}`, flags: MessageFlags.Ephemeral });
    }

    if (commandName === "setwinrate") {
      if (!isAdmin(interaction.member))
        return interaction.reply({ content: "❌ Bạn không có quyền Admin!", flags: MessageFlags.Ephemeral });

      const user = interaction.options.getUser("user");
      const rate = interaction.options.getNumber("rate");
      if (!data.winRateOverrides) data.winRateOverrides = {};
      data.winRateOverrides[user.id] = rate;
      save(data);
      const pct = Math.round(rate * 100);
      return interaction.reply({
        content:
          `🎯 **[Admin]** Tỉ lệ thắng của ${user} = **${pct}%**\n` +
          `*(${pct < 40 ? "⚠️ Rất thấp" : pct > 70 ? "⚠️ Rất cao" : "✅ Bình thường"})*`,
        flags: MessageFlags.Ephemeral
      });
    }

    if (commandName === "resetwinrate") {
      if (!isAdmin(interaction.member))
        return interaction.reply({ content: "❌ Bạn không có quyền Admin!", flags: MessageFlags.Ephemeral });

      const user = interaction.options.getUser("user");
      if (data.winRateOverrides) delete data.winRateOverrides[user.id];
      save(data);
      return interaction.reply({ content: `🔄 **[Admin]** Reset tỉ lệ thắng của ${user} về mặc định`, flags: MessageFlags.Ephemeral });
    }

  } catch (err) {
    console.error("❌ Lỗi xử lý interaction:", err);
    const msg = { content: "⚠️ Đã xảy ra lỗi. Vui lòng thử lại.", flags: MessageFlags.Ephemeral };
    try {
      if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
      else await interaction.reply(msg);
    } catch (_) {}
  }
});

// ──────────────────────────────────────────────────────
process.on("unhandledRejection", (err) => console.error("❌ Unhandled:", err?.message || err));
process.on("uncaughtException",  (err) => console.error("❌ Uncaught:", err?.message || err));

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Bot đang tắt gracefully...");
  
  // Lưu trạng thái cuối cùng
  const data = load();
  if (data.gameRunning) {
    console.log("⚠️ Reset phiên đang chạy...");
    data.gameRunning = false;
    data.currentSession = null;
    save(data);
  }
  
  console.log("✅ Đã lưu dữ liệu. Tạm biệt!");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("🛑 Nhận tín hiệu SIGTERM, đang tắt...");
  process.exit(0);
});

client.login(process.env.TOKEN).catch(err => {
  console.error("❌ Không thể đăng nhập:", err.message);
  process.exit(1);
});
