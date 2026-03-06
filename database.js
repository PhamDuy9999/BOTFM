const fs = require("fs");
const FILE = "./data.json";

const DEFAULT_DATA = {
  users: {},
  vip: {},
  history: [],
  round: 1,
  gameRunning: false,
  currentSession: null,
  winRateOverrides: {} // userId -> winRate (0.0 - 1.0), null = default
};

if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify(DEFAULT_DATA, null, 2));
}

exports.load = () => {
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    const data = JSON.parse(raw);
    // Merge missing keys from DEFAULT_DATA
    return { ...DEFAULT_DATA, ...data };
  } catch (err) {
    console.error("❌ Lỗi đọc database:", err.message);
    return { ...DEFAULT_DATA };
  }
};

exports.save = (d) => {
  try {
    fs.writeFileSync(FILE, JSON.stringify(d, null, 2));
  } catch (err) {
    console.error("❌ Lỗi ghi database:", err.message);
  }
};

exports.getUser = (data, userId) => {
  if (!data.users[userId]) {
    data.users[userId] = { coin: 1000, totalBet: 0, totalWin: 0, totalLose: 0 };
  }
  return data.users[userId];
};
