# 🔍 Hướng Dẫn Check Admin trong Discord Bot

## ✅ Đã Thêm Lệnh `/whoami`

### 🎯 Cách Sử Dụng
```
/whoami
```

**Hiển thị:**
- 🆔 User ID của bạn
- 👤 Username
- 📅 Ngày tạo tài khoản
- 👑 Có phải Server Owner không
- 🛡️ Có quyền Administrator không
- 🤖 Có phải Bot Admin không (có thể dùng lệnh admin bot)
- 📜 Danh sách Roles
- 💵 Số dư VNĐ
- 🎮 Tổng tiền đã cược
- ⚡ VIP multiplier
- 🎯 Tỉ lệ thắng đặc biệt (nếu có)

---

## 🛡️ Cách Bot Check Admin

### Code trong `index.js`:
```javascript
const isAdmin = (member) => member?.permissions?.has("Administrator") ?? false;
```

**Bot kiểm tra:**
1. User có quyền **Administrator** trong Discord Server không
2. Nếu có → Cho phép dùng lệnh admin
3. Nếu không → Từ chối

---

## 📋 Các Lệnh Admin

### Xem thông tin:
```
/xemcoin @user        → Xem coin của user
/allusers             → Xem tất cả users
```

### Quản lý tiền:
```
/setmoney @user 999999    → Set số dư
/addcoin @user 50000      → Cộng thêm tiền
```

### Tính năng đặc biệt:
```
/setvip @user 5           → Set VIP ×5
/setwinrate @user 0.9     → Set 90% thắng
/resetwinrate @user       → Reset về bình thường
```

---

## 🎯 Ví Dụ Sử Dụng `/whoami`

### User thường:
```
/whoami

🔍 Thông Tin: JohnDoe
─────────────────────
🆔 User ID: 123456789012345678
👤 Username: JohnDoe
📅 Tạo tài khoản: 2 năm trước

👑 Server Owner: ❌ Không
🛡️ Administrator: ❌ Không
🤖 Bot Admin: ❌ Không

📜 Roles: `Member`, `Gamer`

💵 Số dư: 50,000 VNĐ
🎮 Tổng cược: 200,000 VNĐ
⚡ VIP: Không
```

### Admin:
```
/whoami

🔍 Thông Tin: AdminUser
─────────────────────
🆔 User ID: 987654321098765432
👤 Username: AdminUser
📅 Tạo tài khoản: 3 năm trước

👑 Server Owner: ✅ Có
🛡️ Administrator: ✅ Có
🤖 Bot Admin: ✅ Có  ← Có thể dùng lệnh admin!

📜 Roles: `Owner`, `Admin`, `Member`

💵 Số dư: 1,000,000 VNĐ
🎮 Tổng cược: 5,000,000 VNĐ
⚡ VIP: ×5
🎯 Tỉ lệ thắng đặc biệt: 100% (Admin đã set)
```

---

## 🔧 Cách Set Admin trong Discord

### Option 1: Quyền Administrator (Đang dùng)
```
1. Vào Discord Server
2. Server Settings → Roles
3. Chọn role (VD: "Admin", "Mod")
4. Bật "Administrator" permission
5. Assign role đó cho user
```

### Option 2: Tạo Role Admin riêng
```
1. Server Settings → Roles
2. Create Role → Đặt tên "Bot Admin"
3. Bật "Administrator" permission
4. Assign cho những người cần quyền bot admin
```

---

## 🎨 Màu Sắc Embed

- **Admin:** 🔴 Màu đỏ (#FF0000)
- **User thường:** 🔵 Màu xanh (#3498DB)

---

## 📊 Thông Tin Hiển Thị

| Field | Mô tả | Ví dụ |
|-------|-------|-------|
| **User ID** | ID Discord duy nhất | 123456789012345678 |
| **Username** | Tên hiển thị | JohnDoe |
| **Tạo tài khoản** | Bao lâu rồi | 2 năm trước |
| **Server Owner** | Chủ server | ✅/❌ |
| **Administrator** | Quyền Discord | ✅/❌ |
| **Bot Admin** | Dùng được lệnh admin bot | ✅/❌ |
| **Roles** | Các role hiện tại | Admin, Member... |
| **Số dư** | Coin hiện có | 50,000 VNĐ |
| **Tổng cược** | Tổng tiền đã cược | 200,000 VNĐ |
| **VIP** | Hệ số nhân thưởng | ×5 |
| **Tỉ lệ thắng** | Nếu admin set | 90% |

---

## 🔍 Cách Lấy ID

### Bật Developer Mode:
```
Discord → User Settings → Advanced → Developer Mode → Bật
```

### Lấy User ID:
```
Right-click user → Copy ID
```

### Lấy Role ID:
```
Server Settings → Roles → Right-click role → Copy ID
```

---

## 🧪 Test Admin

### 1. Test với user thường:
```
/whoami
→ Bot Admin: ❌ Không

/xemcoin @someone
→ ❌ Bạn không có quyền Admin!
```

### 2. Test với admin:
```
/whoami
→ Bot Admin: ✅ Có

/xemcoin @someone
→ Hiển thị thông tin
```

---

## 💡 Tips

### Kiểm tra nhanh ai là admin:
```
/whoami
→ Xem dòng "🤖 Bot Admin"
```

### Debug khi không có quyền:
```
1. /whoami → Xem roles
2. Kiểm tra role có quyền Administrator không
3. Nếu không → Vào Server Settings add quyền
```

### Cho nhiều người admin:
```
1. Tạo role "Bot Admin"
2. Bật Administrator
3. Assign cho nhiều users
```

---

## 🚀 Commands Summary

| Lệnh | Ai dùng được | Mô tả |
|------|-------------|-------|
| `/whoami` | ✅ Mọi người | Xem thông tin & quyền |
| `/xemcoin` | 🛡️ Admin only | Xem coin user |
| `/allusers` | 🛡️ Admin only | Xem tất cả |
| `/setmoney` | 🛡️ Admin only | Set tiền |
| `/addcoin` | 🛡️ Admin only | Cộng tiền |
| `/setvip` | 🛡️ Admin only | Set VIP |
| `/setwinrate` | 🛡️ Admin only | Set tỉ lệ thắng |
| `/resetwinrate` | 🛡️ Admin only | Reset tỉ lệ |

---

## ✅ Status

✅ **Bot đang chạy**
✅ **16 lệnh deployed**
✅ **`/whoami` đã được thêm**
✅ **Check admin hoạt động**

---

## 🎯 Next Steps

1. Test `/whoami` trong Discord
2. Check xem "Bot Admin" có ✅ không
3. Nếu không → Vào Discord add quyền Administrator
4. Test lệnh admin (VD: `/xemcoin`)

---

**Dùng `/whoami` để check admin ngay!** 🔍✨
