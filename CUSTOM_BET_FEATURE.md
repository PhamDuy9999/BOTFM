# 💰 Tính Năng Mới: Nhập Số Tiền Cược Tự Do

## ✨ Tính Năng Đã Thêm

Người dùng giờ có **3 cách** để đặt cược:

### 1️⃣ Nút Nhanh (Có Sẵn)
Bấm các nút có mệnh giá cố định:
- 🔴 TÀI 50K / 100K / 500K / 5M
- 🔵 XỈU 50K / 100K / 500K / 5M  
- 🎯 Số 1-6 (50K)

### 2️⃣ Nút "Nhập Số Tiền" (MỚI) ✍️
Bấm các nút xanh lá:
- **💰 TÀI - Nhập Số Tiền** → Popup nhập số tiền cho TÀI
- **💰 XỈU - Nhập Số Tiền** → Popup nhập số tiền cho XỈU
- **🎯 SỐ - Nhập Số Tiền** → Popup nhập số tiền + chọn số (1-6)

**Ưu điểm:**
- Nhập số tiền bất kỳ: 75.000, 250.000, 1.234.567...
- Giao diện popup đẹp, dễ dùng
- Tự động validate số tiền

### 3️⃣ Slash Command `/dat` (MỚI) 🎯

```
/dat loai:[TÀI/XỈU/Số] sotien:[số VNĐ]
```

**Ví dụ:**
```
/dat loai:TÀI sotien:250000
/dat loai:XỈU sotien:1500000
/dat loai:Số_3 sotien:100000
```

**Ưu điểm:**
- Nhanh nhất cho người quen dùng lệnh
- Không cần bấm nút
- Auto-complete giúp chọn loại cược

---

## 🎮 Hướng Dẫn Sử Dụng

### Cách 1: Dùng Popup Nhập Số Tiền

1. **Bắt đầu phiên:** `/cuoc`
2. **Bấm nút xanh lá** "💰 TÀI - Nhập Số Tiền" (hoặc XỈU/SỐ)
3. **Popup hiện ra** với form nhập:
   ```
   ┌─────────────────────────────────┐
   │  💰 Đặt Cược TÀI                │
   ├─────────────────────────────────┤
   │  Số tiền cược (VNĐ)             │
   │  [_________________________]    │
   │  Từ 50.000 đến 5.000.000 VNĐ    │
   │                                 │
   │         [Hủy]    [Gửi]          │
   └─────────────────────────────────┘
   ```
4. **Nhập số tiền** (VD: `250000` hoặc `250.000`)
5. **Bấm "Gửi"**
6. ✅ Thành công! Bot sẽ confirm:
   ```
   ✅ Đã cược 🔴 TÀI — 250.000 VNĐ
   ⏳ Còn 25s nữa
   ```

### Cách 2: Dùng Lệnh `/dat`

1. **Bắt đầu phiên:** `/cuoc` (hoặc đợi admin mở)
2. **Gõ lệnh:**
   ```
   /dat
   ```
3. **Discord sẽ gợi ý:**
   ```
   loai: [chọn TÀI/XỈU/Số 1-6]
   sotien: [nhập số tiền]
   ```
4. **Chọn và nhập:**
   - `loai`: Chọn "🔴 TÀI (tổng ≥11)"
   - `sotien`: Nhập `250000`
5. **Enter** để gửi
6. ✅ Bot confirm ngay lập tức

---

## 🔧 Chi Tiết Kỹ Thuật

### Files Đã Thay Đổi

#### 1. `embeds.js`
**Thay đổi:** Thêm row 4 với 3 nút "Nhập Số Tiền"

```javascript
const row4 = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("bet_custom_tai")
    .setLabel("💰 TÀI - Nhập Số Tiền")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✍️"),
  // ... XỈU, SỐ
);

return [row1, row2, row3, row4]; // 4 rows thay vì 3
```

#### 2. `game.js`
**Thêm:**
- Import `ModalBuilder`, `TextInputBuilder`
- Logic xử lý nút custom (`bet_custom_tai/xiu/num`)
- Hàm `handleModalBet()` xử lý submit modal
- Hàm `addBet()` cho slash command

**Xử lý Modal:**
```javascript
if (customId === "bet_custom_tai") {
  // Hiện popup với 1 input: Số tiền
  const modal = new ModalBuilder()
    .setCustomId("modal_bet_custom_tai")
    .setTitle("💰 Đặt Cược TÀI");
  
  const amountInput = new TextInputBuilder()
    .setCustomId("amount")
    .setLabel("Số tiền cược (VNĐ)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Từ 50.000 đến 5.000.000 VNĐ")
    .setRequired(true);
  
  // ...
  return interaction.showModal(modal);
}
```

**Xử lý Submit:**
```javascript
exports.handleModalBet = async (interaction) => {
  const amountStr = interaction.fields.getTextInputValue("amount");
  let betAmount = parseInt(amountStr.replace(/[.,\s]/g, "")); // Parse & validate
  
  // Validation...
  currentBets[interaction.user.id] = { type: betType, amount: betAmount };
  // ...
};
```

#### 3. `index.js`
**Thêm:**
- Import `handleModalBet`
- Xử lý `isModalSubmit()` interaction
- Xử lý lệnh `/dat`

```javascript
// Modal Submit
if (interaction.isModalSubmit()) {
  if (interaction.customId.startsWith("modal_bet_custom_")) {
    return await handleModalBet(interaction);
  }
}

// Command /dat
if (commandName === "dat") {
  const betTypeOption = interaction.options.getString("loai");
  const betAmount = interaction.options.getInteger("sotien");
  // ...
}
```

#### 4. `deploy.js`
**Thêm:** Slash command `/dat` với 2 options:
- `loai` (String Choice): TÀI/XỈU/Số 1-6
- `sotien` (Integer): 50,000 - 5,000,000

---

## ✅ Validation & Error Handling

### Kiểm Tra Số Tiền
```javascript
// Parse linh hoạt: "250000" hoặc "250.000" hoặc "250,000"
let betAmount = parseInt(amountStr.replace(/[.,\s]/g, ""));

// Validate range
if (isNaN(betAmount) || betAmount < 50000 || betAmount > 5000000) {
  return "❌ Số tiền không hợp lệ!";
}

// Validate đủ coin
if (userData.coin < betAmount) {
  return "❌ Không đủ tiền!";
}
```

### Kiểm Tra Phiên Đang Chạy
```javascript
if (!data.gameRunning) {
  return "❌ Không có phiên nào đang chạy!";
}
```

### Kiểm Tra Số (1-6)
```javascript
const num = parseInt(numberStr);
if (isNaN(num) || num < 1 || num > 6) {
  return "❌ Số không hợp lệ! Vui lòng nhập từ 1 đến 6";
}
```

---

## 📊 So Sánh 3 Phương Pháp

| Tính năng | Nút Nhanh | Modal Popup | Slash Command |
|-----------|-----------|-------------|---------------|
| **Tốc độ** | ⚡⚡⚡ Nhanh nhất | ⚡⚡ Trung bình | ⚡⚡⚡ Nhanh |
| **Linh hoạt** | ❌ Số cố định | ✅ Tùy ý | ✅ Tùy ý |
| **UX** | 👍 Dễ dùng | 👍👍 Trực quan | 👌 Quen lệnh |
| **Bước thực hiện** | 1 click | 2 click + nhập | 1 lệnh |
| **Phù hợp với** | Người mới | Mọi người | Power user |

---

## 🎯 Ví Dụ Thực Tế

### Scenario 1: Người chơi thường
1. `/cuoc` → Phiên bắt đầu
2. Bấm "🔴 TÀI 100K" → Done! ✅

### Scenario 2: Muốn cược số tiền đặc biệt
1. `/cuoc` → Phiên bắt đầu
2. Bấm "💰 TÀI - Nhập Số Tiền" ✍️
3. Nhập `750000` → Gửi
4. ✅ Cược 750K TÀI

### Scenario 3: Power user
1. Admin đã mở phiên (hoặc `/cuoc`)
2. Gõ: `/dat loai:XỈU sotien:2500000`
3. Enter → Done! ✅

---

## 🚀 Deploy & Test

### 1. Deploy Commands
```bash
node deploy.js
```

**Output:**
```
✅ Deploy thành công 12 lệnh!
   👤 Người chơi: /cuoc /dat /coin /stats /profile /top /help
```

### 2. Restart Bot
```bash
npm start
```

### 3. Test trong Discord

**Test Modal:**
1. `/cuoc`
2. Bấm "💰 TÀI - Nhập Số Tiền"
3. Nhập `123456`
4. Kiểm tra bot reply: "✅ Đã cược 🔴 TÀI — 123.456 VNĐ"

**Test Slash Command:**
1. `/dat loai:TÀI sotien:250000`
2. Kiểm tra bot reply ngay

**Test Validation:**
- Nhập số âm → Lỗi ❌
- Nhập > 5M → Lỗi ❌
- Nhập khi không đủ coin → Lỗi ❌
- Nhập khi không có phiên → Lỗi ❌

---

## 📝 Gợi Ý Viết Lệnh

### Auto-complete trong Discord

Khi gõ `/dat`, Discord sẽ hiển thị:

```
/dat
  loai
    🔴 TÀI (tổng ≥11)
    🔵 XỈU (tổng ≤10)
    🎯 Số 1
    🎯 Số 2
    🎯 Số 3
    🎯 Số 4
    🎯 Số 5
    🎯 Số 6
  sotien
    [50000 - 5000000]
```

### Ví Dụ Lệnh Hợp Lệ

```bash
/dat loai:TÀI sotien:50000         # Cược tối thiểu
/dat loai:XỈU sotien:5000000       # Cược tối đa
/dat loai:Số_3 sotien:100000       # Cược số 3
/dat loai:TÀI sotien:1234567       # Số tiền tùy ý
```

---

## 🎨 UI Preview

### Message với 4 rows buttons:
```
┌─────────────────────────────────────┐
│  🎰 TÀI XỈU - Vòng #5               │
│  ⏳ Thời gian còn lại: 30s          │
├─────────────────────────────────────┤
│  [🔴 TÀI 50K] [🔴 TÀI 100K] ...    │
│  [🔵 XỈU 50K] [🔵 XỈU 100K] ...    │
│  [🎯 Số 1] [🎯 Số 2] [🎯 Số 3] ... │
│  [💰 TÀI ✍️] [💰 XỈU ✍️] [🎯 SỐ ✍️] │ ← MỚI
└─────────────────────────────────────┘
```

### Modal Popup:
```
┌────────────────────────────────────┐
│  💰 Đặt Cược TÀI                   │
├────────────────────────────────────┤
│  Số tiền cược (VNĐ)                │
│  ┌──────────────────────────────┐  │
│  │ 250000                       │  │
│  └──────────────────────────────┘  │
│  Từ 50.000 đến 5.000.000 VNĐ       │
│                                    │
│       [Hủy]          [Gửi]         │
└────────────────────────────────────┘
```

---

## ✅ Checklist

- [x] Thêm 3 nút "Nhập Số Tiền" vào `embeds.js`
- [x] Xử lý Modal trong `game.js`
- [x] Xử lý Modal Submit
- [x] Thêm slash command `/dat`
- [x] Deploy commands lên Discord
- [x] Validation số tiền (min/max/coin)
- [x] Parse số tiền linh hoạt (có/không dấu chấm)
- [x] Cập nhật `/help` với hướng dẫn mới
- [x] Test Modal popup
- [x] Test slash command
- [x] Test validation errors

---

## 🎯 Kết Quả

**Trước:**
- Chỉ cược được số tiền cố định (50K, 100K, 500K, 5M)
- Không linh hoạt

**Sau:**
- ✅ Cược số tiền BẤT KỲ từ 50K-5M
- ✅ 3 cách đặt cược (nút nhanh, modal, lệnh)
- ✅ UX tốt với popup đẹp
- ✅ Auto-complete thông minh
- ✅ Validation chặt chẽ

**Trạng thái:** 🟢 Hoàn thành & Sẵn sàng sử dụng!
