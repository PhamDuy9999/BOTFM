// chart.js — Gọi Python để render ảnh biểu đồ
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { AttachmentBuilder } = require("discord.js");

const OUT_PATH  = path.join(__dirname, "stats_chart.png");
const PY_SCRIPT = path.join(__dirname, "chart_gen.py");

/**
 * Tạo ảnh biểu đồ lịch sử phiên bằng Python + Pillow
 * @param {Array} history - Mảng lịch sử phiên
 * @param {number} round  - Số phiên hiện tại
 * @returns {AttachmentBuilder}
 */
exports.generateStatsChart = (history, round) => {
  const last20   = history.slice(-20);
  const dataPath = path.join(__dirname, "_chart_data.json");

  fs.writeFileSync(dataPath, JSON.stringify({ history: last20, round }), "utf8");

  try {
    execSync(`python3 "${PY_SCRIPT}" "${dataPath}" "${OUT_PATH}"`, {
      timeout: 15000,
      encoding: "utf8"
    });
  } catch (err) {
    throw new Error("Lỗi tạo biểu đồ: " + (err.stderr || err.message || err));
  } finally {
    if (fs.existsSync(dataPath)) fs.unlinkSync(dataPath);
  }

  if (!fs.existsSync(OUT_PATH)) {
    throw new Error("File biểu đồ không được tạo");
  }

  return new AttachmentBuilder(OUT_PATH, { name: "stats_chart.png" });
};
