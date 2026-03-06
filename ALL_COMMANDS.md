# 📚 TỔNG HỢP TẤT CẢ LỆNH - Bot Tài Xỉu Discord

## 🎮 Lệnh Người Chơi (9 lệnh)

### Chơi Game
| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `/cuoc` | Bắt đầu phiên tài xỉu mới | `/cuoc` |
| `/dat` | Đặt cược với số tiền tùy chọn | `/dat loai:TÀI sotien:250000` |
| `/xem` | Xem ai đang cược trong phiên | `/xem` |

### Thông Tin Cá Nhân
| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `/coin` | Xem số dư của mình | `/coin` |
| `/profile [@user]` | Xem hồ sơ (mặc định: mình) | `/profile` hoặc `/profile @user` |

### Thống Kê
| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `/stats` | Biểu đồ lịch sử 20 phiên | `/stats` |
| `/top` | Bảng xếp hạng top 10 | `/top` |

### Hỗ Trợ
| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `/help` | Hướng dẫn chơi | `/help` |

---

## 🛡️ Lệnh Admin (7 lệnh)

### Xem Thông Tin Users
| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `/xemcoin @user` | Xem chi tiết 1 user | `/xemcoin user:@JohnDoe` |
| `/allusers` | Danh sách tất cả users | `/allusers` |

### Quản Lý Coin
| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `/setmoney @user amount:` | Set số dư | `/setmoney user:@John amount:5000000` |
| `/addcoin @user amount:` | Cộng thêm coin | `/addcoin user:@John amount:1000000` |

### Quản Lý VIP
| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `/setvip @user multi:` | Set hệ số VIP (1-10) | `/setvip user:@John multi:3` |

### Quản Lý Win Rate
| Lệnh | Mô tả | Ví dụ |
|------|-------|-------|
| `/setwinrate @user rate:` | Set tỉ lệ thắng (0.0-1.0) | `/setwinrate user:@John rate:0.7` |
| `/resetwinrate @user` | Reset về mặc định | `/resetwinrate user:@John` |

---

## 🎯 Chi Tiết Từng Lệnh

### `/cuoc` - Bắt đầu phiên
**Ai dùng:** Mọi người  
**Cách dùng:** Gõ `/cuoc` trong channel  
**Kết quả:** Bot tạo message với nút cược, đếm ngược 30s

**Lưu ý:**
- Chỉ 1 phiên cùng lúc
- Nếu đang có phiên → Báo "Đã có phiên đang chạy"

---

### `/dat` - Đặt cược bằng lệnh
**Ai dùng:** Mọi người (khi có phiên)  
**Cách dùng:**
```
/dat loai:[TÀI/XỈU/Số] sotien:[50000-5000000]
```

**Ví dụ:**
```
/dat loai:TÀI sotien:250000
/dat loai:XỈU sotien:1500000
/dat loai:Số_3 sotien:100000
```

**Ưu điểm:** Nhanh hơn bấm nút, tùy chỉnh số tiền

---

### `/xem` - Xem người đang cược
**Ai dùng:** Mọi người  
**Cách dùng:** `/xem` khi phiên đang chạy  
**Kết quả:** Hiển thị:
- 🔴 TÀI: Danh sách + số tiền
- 🔵 XỈU: Danh sách + số tiền  
- 🎯 SỐ: Danh sách + số + số tiền
- Tổng pool và số người chơi

---

### `/coin` - Xem số dư mình
**Ai dùng:** Mọi người  
**Cách dùng:** `/coin`  
**Kết quả:** "💵 Username, số dư của bạn: X VNĐ" (chỉ mình thấy)

---

### `/profile [@user]` - Xem hồ sơ
**Ai dùng:** Mọi người  
**Cách dùng:**
```
/profile              # Xem của mình
/profile user:@John   # Xem của người khác
```

**Thông tin hiển thị:**
- Số dư, hạng (Bronze/Silver/Gold/Diamond)
- VIP multiplier
- Tổng cược, thắng, thua
- Tỉ lệ thắng
- Win rate đặc biệt (nếu admin set)

---

### `/stats` - Biểu đồ lịch sử
**Ai dùng:** Mọi người  
**Cách dùng:** `/stats`  
**Kết quả:** Ảnh PNG biểu đồ:
- Chart 1: Tổng điểm 3 xúc xắc
- Chart 2: Từng viên xúc xắc
- Hiển thị 20 phiên gần nhất

**Yêu cầu:** Python 3 + Pillow (nếu không có → fallback text)

---

### `/top` - Bảng xếp hạng
**Ai dùng:** Mọi người  
**Cách dùng:** `/top`  
**Kết quả:** Top 10 người giàu nhất với emoji 🥇🥈🥉

---

### `/help` - Hướng dẫn
**Ai dùng:** Mọi người  
**Cách dùng:** `/help`  
**Kết quả:** Embed đầy đủ hướng dẫn:
- Lệnh cơ bản
- Cách đặt cược (nút, modal, lệnh)
- Tỉ lệ thưởng
- Giới hạn
- Mẹo chơi

---

### `/xemcoin @user` - [Admin] Xem chi tiết user
**Ai dùng:** Chỉ admin  
**Cách dùng:** `/xemcoin user:@JohnDoe`  
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

### `/allusers` - [Admin] Xem tất cả users
**Ai dùng:** Chỉ admin  
**Cách dùng:** `/allusers`  
**Kết quả:** Danh sách top 25 users, xếp theo coin

---

### `/setmoney` - [Admin] Set số dư
**Ai dùng:** Chỉ admin  
**Cách dùng:** `/setmoney user:@John amount:5000000`  
**Giới hạn:** Max 10 tỷ VNĐ

---

### `/addcoin` - [Admin] Cộng coin
**Ai dùng:** Chỉ admin  
**Cách dùng:** `/addcoin user:@John amount:1000000`  
**Giới hạn:** Tổng sau khi cộng max 10 tỷ VNĐ

---

### `/setvip` - [Admin] Set VIP
**Ai dùng:** Chỉ admin  
**Cách dùng:** `/setvip user:@John multi:3`  
**Range:** 1-10  
**Tác dụng:** Nhân thưởng khi thắng ×2, ×3...

---

### `/setwinrate` - [Admin] Set tỉ lệ thắng
**Ai dùng:** Chỉ admin  
**Cách dùng:** `/setwinrate user:@John rate:0.7` (70% thắng)  
**Range:** 0.0 - 1.0  
**Tác dụng:** Override tỉ lệ thắng mặc định

---

### `/resetwinrate` - [Admin] Reset win rate
**Ai dùng:** Chỉ admin  
**Cách dụng:** `/resetwinrate user:@John`  
**Tác dụng:** Xóa win rate đặc biệt, về mặc định

---

## 🎲 3 Cách Đặt Cược

### 1️⃣ Nút Nhanh
- Sau `/cuoc` → Bấm nút có sẵn
- Mệnh giá: 50K, 100K, 500K, 5M
- Nhanh nhất cho người mới

### 2️⃣ Modal Popup (Nhập số tiền)
- Bấm nút xanh "💰 TÀI/XỈU/SỐ - Nhập Số Tiền" ✍️
- Popup hiện ra → Nhập số tiền bất kỳ
- Linh hoạt nhất

### 3️⃣ Lệnh `/dat`
- Gõ `/dat loai:TÀI sotien:250000`
- Auto-complete thông minh
- Nhanh nhất cho power user

---

## 📊 Luật Chơi

### Tài Xỉu
- 🔴 **TÀI:** Tổng 3 xúc xắc ≥ 11 → Thắng ×1.9
- 🔵 **XỈU:** Tổng 3 xúc xắc ≤ 10 → Thắng ×1.9

### Đặt Số
- 🎯 **Số 1-6:** Nếu BẤT KỲ viên nào ra số đó → Thắng ×5

### Giới Hạn
- Tối thiểu: **50.000 VNĐ**
- Tối đa: **5.000.000 VNĐ**
- Mỗi người 1 cược/phiên (có thể update)

### VIP Bonus
- VIP ×2 → Thắng nhận gấp đôi
- VIP ×3 → Thắng nhận gấp 3
- Max VIP: ×10

---

## 🎯 Quick Start

### Người Chơi Mới
```
1. /coin              # Xem số dư (mặc định 1000 VNĐ)
2. /cuoc              # Bắt đầu phiên
3. Bấm "🔴 TÀI 50K"  # Đặt cược nhanh
4. Chờ kết quả        # 30s
5. /coin              # Xem số dư mới
```

### Power User
```
1. /cuoc
2. /dat loai:TÀI sotien:500000
3. /xem               # Xem ai đang cược
4. /stats             # Xem xu hướng
```

### Admin
```
1. /allusers          # Xem tất cả
2. /xemcoin @user     # Check chi tiết
3. /setmoney @user amount:  # Set coin
4. /setvip @user multi:     # Set VIP
```

---

## 📋 Tóm Tắt

- **Tổng cộng:** 16 lệnh
- **Người chơi:** 9 lệnh
- **Admin:** 7 lệnh
- **Cách đặt cược:** 3 cách (nút, modal, lệnh)
- **Giới hạn cược:** 50K - 5M VNĐ
- **Thời gian phiên:** 30 giây
- **Max VIP:** ×10
- **Max coin:** 10 tỷ VNĐ

---

## ✅ Checklist Học Lệnh

### Cơ Bản
- [ ] `/cuoc` - Bắt đầu chơi
- [ ] Bấm nút để cược
- [ ] `/coin` - Xem số dư

### Nâng Cao
- [ ] `/dat` - Cược bằng lệnh
- [ ] Modal popup - Nhập số tiền tùy ý
- [ ] `/xem` - Xem người đang cược
- [ ] `/stats` - Xem biểu đồ

### Admin
- [ ] `/allusers` - Xem danh sách
- [ ] `/xemcoin` - Check user
- [ ] `/setmoney` - Set coin
- [ ] `/setvip` - Set VIP

---

**Chúc may mắn!** 🎲✨
