# 🛡️ Lệnh Admin Mới: Xem Số Dư Users

## ✨ Tính Năng Đã Thêm

Admin giờ có **2 lệnh mới** để quản lý và xem thông tin người chơi:

### 1️⃣ `/xemcoin @user` - Xem Chi Tiết 1 User

Xem đầy đủ thông tin của một người chơi cụ thể.

**Cú pháp:**
```
/xemcoin user:@username
```

**Thông tin hiển thị:**
- 💵 Số dư hiện tại
- 🎮 Tổng tiền đã cược
- 🏆 Số lần thắng
- 💸 Số lần thua
- ⚡ VIP multiplier (nếu có)
- 🎯 Tỉ lệ thắng đặc biệt (nếu admin đã set)

**Ví dụ:**
```
/xemcoin user:@JohnDoe
```

**Kết quả:**
```
[Admin] Thông tin JohnDoe
💵 Số dư: 2.500.000 VNĐ
🎮 Tổng cược: 5.000.000 VNĐ
🏆 Thắng: 15 lần
💸 Thua: 12 lần
⚡ VIP: ×2
🎯 Tỉ lệ thắng đặc biệt: 60%
```

---

### 2️⃣ `/allusers` - Xem Danh Sách Tất Cả Users

Hiển thị danh sách tất cả người chơi trong hệ thống, xếp theo số dư.

**Cú pháp:**
```
/allusers
```

**Thông tin hiển thị:**
- Top 25 users giàu nhất
- Số dư của từng người
- VIP multiplier (nếu có)
- Tỉ lệ thắng đặc biệt (nếu có)
- Tổng số users trong hệ thống

**Ví dụ kết quả:**
```
🛡️ [Admin] Danh Sách Users
Tổng: 45 người

💰 Top 25 Users
1. @User1: 10.000.000 VNĐ ⚡×3 🎯70%
2. @User2: 5.500.000 VNĐ ⚡×2
3. @User3: 3.200.000 VNĐ
4. @User4: 2.800.000 VNĐ 🎯45%
...
25. @User25: 100.000 VNĐ

Hiển thị 25/45 users
```

---

## 🎮 Hướng Dẫn Sử Dụng

### Scenario 1: Kiểm tra user cụ thể

**Tình huống:** User @Alice khiếu nại mất coin

1. **Gõ lệnh:**
   ```
   /xemcoin user:@Alice
   ```

2. **Xem thông tin:**
   ```
   💵 Số dư: 150.000 VNĐ
   🎮 Tổng cược: 2.000.000 VNĐ
   🏆 Thắng: 5 lần
   💸 Thua: 18 lần
   ```

3. **Phân tích:** Alice thua nhiều nên coin thấp là bình thường

4. **Hành động:** Có thể `/addcoin user:@Alice amount:500000` để bù

---

### Scenario 2: Tìm người có coin bất thường

1. **Gõ:**
   ```
   /allusers
   ```

2. **Phát hiện:** User #5 có 999.999.999 VNĐ (nghi ngờ bug)

3. **Kiểm tra chi tiết:**
   ```
   /xemcoin user:@SuspiciousUser
   ```

4. **Sửa:**
   ```
   /setmoney user:@SuspiciousUser amount:1000000
   ```

---

### Scenario 3: Tặng thưởng event

1. **Xem top giàu:**
   ```
   /allusers
   ```

2. **Chọn top 3 để tặng thưởng:**
   ```
   /addcoin user:@Top1 amount:5000000
   /addcoin user:@Top2 amount:3000000
   /addcoin user:@Top3 amount:1000000
   ```

---

## 🔒 Bảo Mật

### Quyền Admin
- ✅ Chỉ admin thấy được lệnh `/xemcoin` và `/allusers`
- ✅ Non-admin gõ lệnh → Báo lỗi: "❌ Bạn không có quyền Admin!"
- ✅ Kết quả chỉ hiện cho admin (ephemeral message)

### Privacy
- User thường **KHÔNG thể** xem coin của người khác
- User chỉ xem coin của mình bằng `/coin`
- Admin xem được **TẤT CẢ** thông tin

---

## 📊 So Sánh Lệnh

| Lệnh | Ai dùng | Xem ai | Thông tin |
|------|---------|--------|-----------|
| `/coin` | Mọi người | Chính mình | Chỉ số dư |
| `/profile [@user]` | Mọi người | Mọi người | Hồ sơ công khai |
| `/xemcoin @user` | Admin | Bất kỳ ai | Chi tiết đầy đủ |
| `/allusers` | Admin | Tất cả | Danh sách + số dư |
| `/top` | Mọi người | Top 10 | Chỉ số dư |

---

## 🎯 Use Cases

### 1. Moderation
- Kiểm tra user có coin bất thường
- Phát hiện người dùng nhiều tài khoản
- Tracking người chơi VIP

### 2. Support
- Giải quyết khiếu nại mất coin
- Xác minh giao dịch
- Hỗ trợ người chơi mới

### 3. Event Management
- Chọn người thắng event
- Tặng thưởng top player
- Tracking leaderboard

### 4. Analytics
- Xem tổng số người chơi
- Phân tích phân bố coin
- Theo dõi user active

---

## 🚀 Commands Admin Đầy Đủ

### Quản Lý Coin
```bash
/xemcoin user:@username           # Xem chi tiết 1 user
/allusers                         # Xem tất cả users
/setmoney user:@username amount:  # Set số dư
/addcoin user:@username amount:   # Cộng thêm coin
```

### Quản Lý VIP
```bash
/setvip user:@username multi:2    # Set VIP ×2
```

### Quản Lý Win Rate
```bash
/setwinrate user:@username rate:0.7    # Set 70% thắng
/resetwinrate user:@username           # Reset về mặc định
```

---

## ⚡ Tips & Tricks

### Tìm User Nhanh
Discord auto-complete sẽ gợi ý username khi bạn gõ `@`

### Xem VIP Users
Trong `/allusers`, users có VIP sẽ có icon ⚡×2, ⚡×3...

### Xem Win Rate Custom
Users có tỉ lệ thắng đặc biệt sẽ có icon 🎯 + phần trăm

### Copy User ID
Click chuột phải vào user → Copy ID → Dùng cho các API tool

---

## 📋 Checklist

- [x] Thêm lệnh `/xemcoin`
- [x] Thêm lệnh `/allusers`
- [x] Deploy commands lên Discord
- [x] Kiểm tra quyền admin
- [x] Test với user có VIP
- [x] Test với user có win rate custom
- [x] Test hiển thị ephemeral
- [x] Format số tiền đẹp
- [x] Sắp xếp theo coin giảm dần

---

## 🎨 UI Preview

### Lệnh `/xemcoin`
```
┌─────────────────────────────────────┐
│ [Admin] Thông tin JohnDoe           │
├─────────────────────────────────────┤
│ 💵 Số dư: 2.500.000 VNĐ             │
│ 🎮 Tổng cược: 5.000.000 VNĐ         │
│ 🏆 Thắng: 15 lần                    │
│ 💸 Thua: 12 lần                     │
│ ⚡ VIP: ×2                           │
│ 🎯 Tỉ lệ thắng đặc biệt: 60%        │
└─────────────────────────────────────┘
```

### Lệnh `/allusers`
```
┌─────────────────────────────────────┐
│ 🛡️ [Admin] Danh Sách Users          │
│ Tổng: 45 người                      │
├─────────────────────────────────────┤
│ 💰 Top 25 Users                     │
│                                     │
│ 1. @User1: 10.000.000 VNĐ ⚡×3 🎯70% │
│ 2. @User2: 5.500.000 VNĐ ⚡×2       │
│ 3. @User3: 3.200.000 VNĐ           │
│ 4. @User4: 2.800.000 VNĐ 🎯45%     │
│ ...                                 │
│ 25. @User25: 100.000 VNĐ           │
│                                     │
│ Hiển thị 25/45 users                │
└─────────────────────────────────────┘
```

---

## ✅ Hoàn Thành!

Bot giờ đã có đầy đủ công cụ quản lý cho admin:

✅ Xem chi tiết bất kỳ user nào (`/xemcoin`)
✅ Xem danh sách tất cả users (`/allusers`)
✅ Set/add coin (`/setmoney`, `/addcoin`)
✅ Quản lý VIP (`/setvip`)
✅ Tùy chỉnh win rate (`/setwinrate`, `/resetwinrate`)

**Deployed:** 15 lệnh total
**Admin commands:** 7 lệnh
**Trạng thái:** 🟢 Sẵn sàng sử dụng!
