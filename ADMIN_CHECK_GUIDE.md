# 🛡️ Hướng Dẫn Kiểm Tra Admin trong Discord Bot

## 🎯 Hiện Tại Bot Đang Dùng

### Code trong `index.js` (line 16):
```javascript
const isAdmin = (member) => member?.permissions?.has("Administrator") ?? false;
```

**Giải thích:**
- ✅ Check xem user có quyền **Administrator** trong server không
- ✅ Quyền này được set trong Discord Server Settings → Roles
- ✅ An toàn với optional chaining (`?.`)

---

## 📊 Các Cách Kiểm Tra Admin

### 1️⃣ **Check Permission Administrator** (Đang dùng)
```javascript
const isAdmin = (member) => member?.permissions?.has("Administrator") ?? false;

// Sử dụng:
if (isAdmin(interaction.member)) {
  // Cho phép dùng lệnh admin
} else {
  await interaction.reply({ 
    content: "❌ Chỉ admin mới dùng được lệnh này!", 
    ephemeral: true 
  });
}
```

**Ưu điểm:**
- ✅ Đơn giản, dễ hiểu
- ✅ Dùng permission có sẵn của Discord
- ✅ Admin server tự động có quyền

**Nhược điểm:**
- ❌ Không linh hoạt (phải có quyền Administrator)

---

### 2️⃣ **Check Role ID Cụ Thể**
```javascript
const ADMIN_ROLE_IDS = ["123456789012345678", "987654321098765432"];

const isAdmin = (member) => {
  if (!member || !member.roles) return false;
  return member.roles.cache.some(role => ADMIN_ROLE_IDS.includes(role.id));
};
```

**Ưu điểm:**
- ✅ Linh hoạt - chỉ định role nào được quyền
- ✅ Có thể có nhiều role admin
- ✅ Không cần quyền Administrator Discord

**Nhược điểm:**
- ❌ Phải lấy Role ID thủ công
- ❌ Cần update code nếu đổi role

**Cách lấy Role ID:**
1. Discord → Server Settings → Roles
2. Right-click vào role → Copy ID
3. Bật Developer Mode: User Settings → Advanced → Developer Mode

---

### 3️⃣ **Check User ID Cụ Thể** (Whitelist)
```javascript
const ADMIN_USER_IDS = [
  "123456789012345678",  // User 1
  "987654321098765432"   // User 2
];

const isAdmin = (member) => {
  return ADMIN_USER_IDS.includes(member?.user?.id);
};
```

**Ưu điểm:**
- ✅ Cụ thể nhất
- ✅ Kiểm soát hoàn toàn

**Nhược điểm:**
- ❌ Phải update code khi thêm admin
- ❌ Không scale nếu nhiều admin

**Cách lấy User ID:**
1. Right-click vào user trong Discord
2. Copy ID

---

### 4️⃣ **Check Role Name**
```javascript
const ADMIN_ROLE_NAMES = ["Admin", "Moderator", "Owner"];

const isAdmin = (member) => {
  if (!member || !member.roles) return false;
  return member.roles.cache.some(role => 
    ADMIN_ROLE_NAMES.includes(role.name)
  );
};
```

**Ưu điểm:**
- ✅ Dễ đọc
- ✅ Không cần lấy ID

**Nhược điểm:**
- ❌ User có thể đổi tên role
- ❌ Không an toàn bằng ID

---

### 5️⃣ **Check Server Owner**
```javascript
const isAdmin = (member) => {
  return member?.guild?.ownerId === member?.user?.id;
};
```

**Ưu điểm:**
- ✅ Chỉ owner mới có quyền
- ✅ An toàn tuyệt đối

**Nhược điểm:**
- ❌ Chỉ 1 người (owner)
- ❌ Không linh hoạt

---

### 6️⃣ **Kết Hợp Nhiều Cách**
```javascript
const ADMIN_USER_IDS = ["123456789012345678"];
const ADMIN_ROLE_IDS = ["987654321098765432"];

const isAdmin = (member) => {
  if (!member) return false;
  
  // Check 1: Server owner
  if (member.guild?.ownerId === member.user?.id) return true;
  
  // Check 2: Administrator permission
  if (member.permissions?.has("Administrator")) return true;
  
  // Check 3: Specific user IDs
  if (ADMIN_USER_IDS.includes(member.user?.id)) return true;
  
  // Check 4: Specific role IDs
  if (member.roles?.cache.some(role => ADMIN_ROLE_IDS.includes(role.id))) {
    return true;
  }
  
  return false;
};
```

**Ưu điểm:**
- ✅ Rất linh hoạt
- ✅ Nhiều cấp độ admin
- ✅ Fallback an toàn

**Nhược điểm:**
- ❌ Phức tạp hơn

---

## 🔍 Cách Xem Thông Tin User

### In ra console để debug:
```javascript
client.on("interactionCreate", async (interaction) => {
  const member = interaction.member;
  
  console.log("──────────────────────────────");
  console.log("🆔 User ID:", member.user.id);
  console.log("👤 Username:", member.user.username);
  console.log("👑 Server Owner:", member.guild.ownerId === member.user.id);
  console.log("🛡️ Has Admin:", member.permissions.has("Administrator"));
  console.log("📜 Roles:", member.roles.cache.map(r => ({
    id: r.id,
    name: r.name
  })));
  console.log("──────────────────────────────");
});
```

---

## 🎮 Lệnh Kiểm Tra Trong Discord

### Tạo lệnh `/whoami`:
```javascript
// Trong deploy.js
new SlashCommandBuilder()
  .setName("whoami")
  .setDescription("Xem thông tin về bạn"),

// Trong index.js
if (commandName === "whoami") {
  const member = interaction.member;
  const roles = member.roles.cache
    .filter(r => r.name !== "@everyone")
    .map(r => r.name)
    .join(", ") || "Không có role";
  
  const embed = new EmbedBuilder()
    .setColor(COLORS.info)
    .setTitle("👤 Thông Tin Của Bạn")
    .addFields(
      { name: "🆔 User ID", value: member.user.id, inline: true },
      { name: "👤 Username", value: member.user.username, inline: true },
      { name: "👑 Owner", value: member.guild.ownerId === member.user.id ? "✅" : "❌", inline: true },
      { name: "🛡️ Admin", value: isAdmin(member) ? "✅" : "❌", inline: true },
      { name: "📜 Roles", value: roles }
    )
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
```

---

## 🛠️ Thêm Role Admin Vào Bot

### Option 1: Dùng Role ID (Recommend)

**Bước 1:** Lấy Role ID
```
1. Vào Discord Server
2. Server Settings → Roles
3. Tạo role "Bot Admin" (hoặc dùng role có sẵn)
4. Right-click → Copy ID
```

**Bước 2:** Update code
```javascript
// Thêm vào đầu index.js
const ADMIN_ROLE_IDS = [
  "1234567890123456789",  // Role "Bot Admin"
  "9876543210987654321"   // Role "Moderator"
];

// Sửa function isAdmin
const isAdmin = (member) => {
  if (!member) return false;
  
  // Check Administrator permission
  if (member.permissions?.has("Administrator")) return true;
  
  // Check specific roles
  if (member.roles?.cache.some(role => ADMIN_ROLE_IDS.includes(role.id))) {
    return true;
  }
  
  return false;
};
```

---

### Option 2: Dùng User ID

**Bước 1:** Lấy User ID
```
1. Bật Developer Mode
2. Right-click user → Copy ID
```

**Bước 2:** Update code
```javascript
const ADMIN_USER_IDS = [
  "123456789012345678",  // User 1
  "987654321098765432"   // User 2
];

const isAdmin = (member) => {
  if (!member) return false;
  return member.permissions?.has("Administrator") || 
         ADMIN_USER_IDS.includes(member.user?.id);
};
```

---

## ⚠️ Lưu Ý Bảo Mật

### ✅ NÊN:
- Dùng `ephemeral: true` cho reply lệnh admin
- Check permission trước khi thực thi
- Log các hành động admin
- Dùng Role/User ID thay vì name

### ❌ KHÔNG NÊN:
- Hard-code password/secret trong code
- Tin tưởng username/displayName
- Để lỗi leak thông tin
- Public admin commands cho mọi người

---

## 📊 So Sánh Các Phương Pháp

| Phương pháp | Bảo mật | Linh hoạt | Dễ dùng | Recommend |
|-------------|---------|-----------|---------|-----------|
| Administrator Permission | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ✅ Đang dùng |
| Role ID | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ✅ Tốt nhất |
| User ID | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⚠️ Ít admin |
| Role Name | ⭐ | ⭐⭐ | ⭐⭐⭐ | ❌ Không an toàn |
| Owner Only | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⚠️ Quá strict |

---

## 🎯 Recommendation

### Cho bot nhỏ (1-2 admin):
```javascript
const isAdmin = (member) => member?.permissions?.has("Administrator") ?? false;
```
→ **Đang dùng, OK!**

### Cho bot lớn (nhiều admin, nhiều cấp độ):
```javascript
const ADMIN_ROLE_IDS = ["123...", "456..."];

const isAdmin = (member) => {
  if (!member) return false;
  return member.permissions?.has("Administrator") || 
         member.roles?.cache.some(r => ADMIN_ROLE_IDS.includes(r.id));
};
```

---

## 🧪 Test Admin

### Cách test:
```
1. /xemcoin @user → Chỉ admin dùng được
2. /setmoney @user 999999 → Chỉ admin dùng được
3. /cuoc → Mọi người dùng được
```

### Debug:
```javascript
// Thêm vào lệnh admin
console.log("User:", interaction.user.username);
console.log("Is Admin:", isAdmin(interaction.member));
console.log("Permissions:", interaction.member.permissions.toArray());
```

---

**Tóm lại:**
- Bot hiện tại dùng **Administrator Permission** → Đơn giản, an toàn
- Nếu muốn linh hoạt hơn → Dùng **Role ID**
- Dùng lệnh `/whoami` để xem thông tin của mình
- Test kỹ trước khi deploy production!

🛡️ **Security first!**
