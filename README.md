# 🎲 Bot Discord Tài Xỉu v2.0

Bot minigame Tài Xỉu 3 xúc xắc cho Discord, viết bằng JavaScript (discord.js v14).

## 📁 Cấu trúc

```
discord-taixiu-bot/
├── index.js        # Entry point, xử lý tất cả commands & interactions
├── game.js         # Logic game (bắt đầu/kết thúc phiên, xử lý cược)
├── embeds.js       # Tất cả thiết kế embed Discord
├── database.js     # Đọc/ghi dữ liệu JSON
├── utils.js        # Hàm tiện ích (rollDice, formatCoin, winRate...)
├── deploy.js       # Deploy slash commands lên Discord
├── data.json       # Database (tự tạo khi chạy lần đầu)
├── .env            # Biến môi trường (tạo từ .env.example)
└── package.json
```

## 🚀 Cài đặt

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env
cp .env.example .env
# Rồi mở .env và điền TOKEN, CLIENT_ID, GUILD_ID

# 3. Deploy slash commands
npm run deploy

# 4. Chạy bot
npm start
```

## 🎮 Lệnh

### Người chơi
| Lệnh | Mô tả |
|------|-------|
| `/cuoc` | Bắt đầu phiên tài xỉu mới |
| `/coin` | Xem số dư |
| `/stats` | Thống kê biểu đồ các phiên |
| `/profile [@user]` | Xem hồ sơ cá nhân |
| `/top` | Bảng xếp hạng |
| `/help` | Hướng dẫn |

### Admin
| Lệnh | Mô tả |
|------|-------|
| `/setmoney @user <amount>` | Set số tiền |
| `/addcoin @user <amount>` | Cộng thêm tiền |
| `/setvip @user <1-10>` | Set hệ số VIP |
| `/setwinrate @user <0.0-1.0>` | Tùy chỉnh tỉ lệ thắng |
| `/resetwinrate @user` | Xóa tỉ lệ thắng đặc biệt |

## ⚖️ Tỉ lệ thắng mặc định (theo số dư)

| Số dư | Tỉ lệ thắng |
|-------|------------|
| < 2,000 | 50% |
| 2,000 – 4,999 | 45% |
| 5,000 – 9,999 | 40% |
| ≥ 10,000 | 35% |

> Admin có thể override bất kỳ user nào bằng `/setwinrate`

## 💰 Bảng thưởng

| Loại cược | Payout |
|-----------|--------|
| TÀI / XỈU | ×1.9 |
| Đặt số (1–6) | ×5 |

VIP multiplier nhân thêm vào phần thưởng.
