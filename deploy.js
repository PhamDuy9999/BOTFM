require("dotenv").config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const commands = [
  // ── NGƯỜI CHƠI ──────────────────────────────────
  new SlashCommandBuilder().setName("cuoc").setDescription("🎲 Bắt đầu phiên tài xỉu mới"),
  
  new SlashCommandBuilder()
    .setName("dat")
    .setDescription("💰 Đặt cược với số tiền tùy chọn")
    .addStringOption(o => o
      .setName("loai")
      .setDescription("Loại cược")
      .setRequired(true)
      .addChoices(
        { name: "🔴 TÀI (tổng ≥11)", value: "tai" },
        { name: "🔵 XỈU (tổng ≤10)", value: "xiu" },
        { name: "🎯 Số 1", value: "num_1" },
        { name: "🎯 Số 2", value: "num_2" },
        { name: "🎯 Số 3", value: "num_3" },
        { name: "🎯 Số 4", value: "num_4" },
        { name: "🎯 Số 5", value: "num_5" },
        { name: "🎯 Số 6", value: "num_6" }
      ))
    .addIntegerOption(o => o
      .setName("sotien")
      .setDescription("Số tiền cược (VNĐ)")
      .setRequired(true)
      .setMinValue(1000)
      .setMaxValue(5000000)),
  
  new SlashCommandBuilder().setName("xem").setDescription("👀 Xem ai đang cược trong phiên hiện tại"),
  new SlashCommandBuilder().setName("coin").setDescription("💵 Xem số dư VNĐ hiện tại"),
  new SlashCommandBuilder().setName("stats").setDescription("📊 Biểu đồ lịch sử phiên"),
  new SlashCommandBuilder()
    .setName("profile").setDescription("👤 Xem hồ sơ cá nhân")
    .addUserOption(o => o.setName("user").setDescription("Xem của người khác (tùy chọn)").setRequired(false)),
  new SlashCommandBuilder().setName("top").setDescription("🏆 Bảng xếp hạng"),
  new SlashCommandBuilder().setName("help").setDescription("📖 Hướng dẫn chơi"),
  new SlashCommandBuilder().setName("whoami").setDescription("🔍 Xem thông tin và quyền của bạn"),

  // ── ADMIN (ẩn với người thường) ─────────────────
  new SlashCommandBuilder()
    .setName("xemcoin").setDescription("[Admin] Xem số dư của user")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName("user").setDescription("Người dùng cần xem").setRequired(true)),

  new SlashCommandBuilder()
    .setName("allusers").setDescription("[Admin] Xem danh sách tất cả users và số dư")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName("setmoney").setDescription("[Admin] Set số dư cho user")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName("user").setDescription("Người dùng").setRequired(true))
    .addIntegerOption(o => o.setName("amount").setDescription("Số tiền VNĐ").setRequired(true).setMinValue(0)),

  new SlashCommandBuilder()
    .setName("addcoin").setDescription("[Admin] Cộng thêm tiền VNĐ cho user")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName("user").setDescription("Người dùng").setRequired(true))
    .addIntegerOption(o => o.setName("amount").setDescription("Số tiền cộng thêm (VNĐ)").setRequired(true)),

  new SlashCommandBuilder()
    .setName("setvip").setDescription("[Admin] Set hệ số VIP")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName("user").setDescription("Người dùng").setRequired(true))
    .addIntegerOption(o => o.setName("multi").setDescription("Hệ số (1–10)").setRequired(true).setMinValue(1).setMaxValue(10)),

  new SlashCommandBuilder()
    .setName("setwinrate").setDescription("[Admin] Tùy chỉnh tỉ lệ thắng")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName("user").setDescription("Người dùng").setRequired(true))
    .addNumberOption(o => o.setName("rate").setDescription("0.0 = luôn thua, 1.0 = luôn thắng").setRequired(true).setMinValue(0).setMaxValue(1)),

  new SlashCommandBuilder()
    .setName("resetwinrate").setDescription("[Admin] Reset tỉ lệ thắng về mặc định")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(o => o.setName("user").setDescription("Người dùng").setRequired(true)),

].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🔄 Đang deploy slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log(`✅ Deploy thành công ${commands.length} lệnh!`);
    console.log("   👤 Người chơi: /cuoc /coin /stats /profile /top /help");
    console.log("   🛡️ Admin only: /setmoney /addcoin /setvip /setwinrate /resetwinrate");
  } catch (err) {
    console.error("❌ Lỗi deploy:", err.message);
    process.exit(1);
  }
})();
