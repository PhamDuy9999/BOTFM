# 📊 Thống Kê TÀI/XỈU Real-Time

## ✅ Đã Thêm Tính Năng

Khi phiên game đang chạy (`/cuoc`), bot sẽ hiển thị **thống kê realtime**:

### 📊 Thông Tin Hiển Thị:

```
╔══════════════════════╗
        🎲  TÀI XỈU  🎲
╚══════════════════════╝

  Phiên #123  •  Cược đang mở

🟢 ▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱ `25s`

👥 **5 người** đang chơi
💰 Tổng pool: **250,000 VNĐ**

**📊 Thống kê cược:**
> 🔴 **TÀI:** 3 người • 150,000 VNĐ
> 🔵 **XỈU:** 1 người • 50,000 VNĐ
> 🎯 **SỐ:** 1 người • 50,000 VNĐ
```

---

## 🎯 Tính Năng Chính

### 1️⃣ **Số Người Cược Theo Loại**
- 🔴 TÀI: Bao nhiêu người chọn TÀI
- 🔵 XỈU: Bao nhiêu người chọn XỈU
- 🎯 SỐ: Bao nhiêu người đặt số (1-6)

### 2️⃣ **Tổng Tiền Cược Theo Loại**
- Hiển thị tổng số tiền VNĐ cho từng loại
- Format với dấu phẩy dễ đọc (VD: 150,000 VNĐ)

### 3️⃣ **Cập Nhật Real-Time**
- Update mỗi giây
- Tự động thêm/bớt khi người chơi cược
- Hiển thị countdown 30s → 0s

### 4️⃣ **Hiển Thị Thông Minh**
- Nếu không có người cược → Không hiển thị thống kê
- Chỉ hiển thị loại nào có người cược
- VD: Nếu không ai chọn SỐ → Không hiển thị dòng 🎯

---

## 📱 Ví Dụ Các Trường Hợp

### Trường hợp 1: Chưa ai cược
```
👥 0 người đang chơi
💰 Tổng pool: 0 VNĐ

(Không hiển thị thống kê)
```

### Trường hợp 2: Chỉ có TÀI
```
👥 **2 người** đang chơi
💰 Tổng pool: **100,000 VNĐ**

**📊 Thống kê cược:**
> 🔴 **TÀI:** 2 người • 100,000 VNĐ
```

### Trường hợp 3: TÀI + XỈU
```
👥 **5 người** đang chơi
💰 Tổng pool: **250,000 VNĐ**

**📊 Thống kê cược:**
> 🔴 **TÀI:** 3 người • 150,000 VNĐ
> 🔵 **XỈU:** 2 người • 100,000 VNĐ
```

### Trường hợp 4: TÀI + XỈU + SỐ
```
👥 **10 người** đang chơi
💰 Tổng pool: **1,500,000 VNĐ**

**📊 Thống kê cược:**
> 🔴 **TÀI:** 4 người • 500,000 VNĐ
> 🔵 **XỈU:** 4 người • 600,000 VNĐ
> 🎯 **SỐ:** 2 người • 400,000 VNĐ
```

---

## 🔧 Code Thay Đổi

### File: `game.js`

**Thêm tính toán thống kê:**
```javascript
// Tính thống kê TÀI/XỈU/SỐ
const taiCount = Object.values(currentBets).filter(b => b.type === "tai").length;
const xiuCount = Object.values(currentBets).filter(b => b.type === "xiu").length;
const numCount = Object.values(currentBets).filter(b => b.type.startsWith("num_")).length;

const taiAmount = Object.values(currentBets).filter(b => b.type === "tai").reduce((s, b) => s + b.amount, 0);
const xiuAmount = Object.values(currentBets).filter(b => b.type === "xiu").reduce((s, b) => s + b.amount, 0);
const numAmount = Object.values(currentBets).filter(b => b.type.startsWith("num_")).reduce((s, b) => s + b.amount, 0);

const betStats = {
  taiCount, xiuCount, numCount,
  taiAmount, xiuAmount, numAmount
};
```

**Truyền vào embed:**
```javascript
const updatedEmbed = createGameEmbed(data.round, countdown, betsCount, totalPot, betStats);
```

### File: `embeds.js`

**Function signature mới:**
```javascript
exports.createGameEmbed = (round, countdown, betsCount, totalPot, betStats = {}) => {
  // ...
  
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
  
  // Thêm vào description
  .setDescription(
    // ...
    `💰 Tổng pool: **${formatCoin(totalPot)} VNĐ**\n` +
    `${statsText}`
  )
}
```

---

## 💡 Lợi Ích

### Cho Người Chơi:
- ✅ **Thấy được xu hướng:** Nhiều người chọn TÀI hay XỈU?
- ✅ **Ra quyết định tốt hơn:** Nếu TÀI quá nhiều, có thể chọn XỈU
- ✅ **Cảm giác cộng đồng:** Thấy có bao nhiêu người chơi cùng
- ✅ **Minh bạch:** Biết tổng pool là bao nhiêu

### Cho Admin:
- ✅ **Giám sát phiên:** Thấy phân bổ cược
- ✅ **Phát hiện bất thường:** Nếu pool quá lớn/nhỏ
- ✅ **Debug dễ hơn:** Xem stats real-time

---

## 🎮 Cách Sử Dụng

### Người Chơi:
```
1. /cuoc → Bắt đầu phiên
2. Nhìn thống kê để quyết định
3. Đặt cược (nút hoặc /dat)
4. Xem stats update realtime
```

### Chiến Thuật:
```
Nếu thấy:
🔴 TÀI: 10 người • 2,000,000 VNĐ
🔵 XỈU: 1 người • 50,000 VNĐ

→ Có thể rủi ro chọn XỈU (ít người cược)
→ Hoặc an toàn theo số đông (TÀI)
```

---

## 🧪 Test

### Test case 1: 1 người chơi
```
/cuoc
→ Bấm "🔴 TÀI 50K"
→ Xem stats: "🔴 TÀI: 1 người • 50,000 VNĐ"
```

### Test case 2: Nhiều người
```
User A: Chọn TÀI 100K
User B: Chọn TÀI 50K
User C: Chọn XỈU 200K

→ Stats:
🔴 TÀI: 2 người • 150,000 VNĐ
🔵 XỈU: 1 người • 200,000 VNĐ
```

### Test case 3: Update cược
```
User A: Chọn TÀI 50K
→ Stats: TÀI 1 người • 50,000 VNĐ

User A: Đổi sang XỈU 100K
→ Stats: XỈU 1 người • 100,000 VNĐ
(TÀI biến mất vì không còn ai)
```

---

## 📊 Thống Kê Hiển Thị

| Loại | Icon | Mô tả |
|------|------|-------|
| **TÀI** | 🔴 | Tổng ≥11 |
| **XỈU** | 🔵 | Tổng ≤10 |
| **SỐ** | 🎯 | Đặt số 1-6 |

### Format Số Tiền:
```
1,000 VNĐ
50,000 VNĐ
1,500,000 VNĐ
```

---

## ⚙️ Cấu Hình

### Thời gian update:
```javascript
setInterval(async () => {
  // Update mỗi 1 giây
  countdown--;
  // ...
  // Tính stats
  // Edit message
}, 1000);
```

### Hiển thị điều kiện:
- Stats chỉ hiện khi `betsCount > 0`
- Mỗi loại chỉ hiện khi có người cược
- Format tự động với `formatCoin()`

---

## 🎯 Kết Quả

### Trước:
```
👥 **5 người** đang chơi
💰 Tổng pool: **250,000 VNĐ**
```

### Sau:
```
👥 **5 người** đang chơi
💰 Tổng pool: **250,000 VNĐ**

**📊 Thống kê cược:**
> 🔴 **TÀI:** 3 người • 150,000 VNĐ
> 🔵 **XỈU:** 2 người • 100,000 VNĐ
```

→ **Chi tiết hơn, rõ ràng hơn, hữu ích hơn!** 📊✨

---

## ✅ Status

✅ **Đã implement**
✅ **Bot đang chạy**
✅ **Test thành công**
✅ **Real-time update**
✅ **Format đẹp**

---

## 🚀 Lệnh Liên Quan

| Lệnh | Mô tả |
|------|-------|
| `/cuoc` | Bắt đầu phiên → Thấy stats |
| `/xem` | Xem chi tiết ai cược gì |
| `/dat` | Cược nhanh qua lệnh |
| `/help` | Hướng dẫn chơi |

---

**Giờ người chơi biết bao nhiêu người chọn TÀI/XỈU và tổng tiền cược rồi!** 📊🎲✨
