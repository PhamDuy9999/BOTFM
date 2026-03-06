# 🚀 Hướng dẫn Deploy Bot lên CentOS Server

## 📋 Yêu cầu hệ thống
- CentOS 7/8/9 hoặc Rocky Linux/AlmaLinux
- RAM: Tối thiểu 512MB (khuyến nghị 1GB+)
- Root hoặc sudo access
- Port mở: 443, 80 (nếu cần web dashboard)

---

## 🛠️ BƯỚC 1: Cài đặt Node.js trên CentOS

### CentOS 7/8:
```bash
# Cài đặt Node.js 18.x (LTS)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Kiểm tra phiên bản
node --version  # Nên >= 18.0.0
npm --version
```

### CentOS 9 / Rocky Linux / AlmaLinux:
```bash
# Sử dụng DNF thay vì YUM
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Kiểm tra
node --version
npm --version
```

---

## 🐍 BƯỚC 2: Cài đặt Python 3 và Pillow

### CentOS 7:
```bash
# Cài Python 3 và pip
sudo yum install -y python3 python3-pip python3-devel

# Cài các thư viện cần thiết cho Pillow
sudo yum install -y libjpeg-devel zlib-devel freetype-devel lcms2-devel \
    openjpeg2-devel libtiff-devel tk-devel tcl-devel

# Cài Pillow
pip3 install --user Pillow
```

### CentOS 8/9:
```bash
# Cài Python 3
sudo dnf install -y python3 python3-pip python3-devel

# Cài thư viện cho Pillow
sudo dnf install -y libjpeg-devel zlib-devel freetype-devel lcms2-devel \
    openjpeg2-devel libtiff-devel tk-devel

# Cài Pillow
pip3 install --user Pillow
```

---

## 📦 BƯỚC 3: Cài đặt Git và PM2

```bash
# Cài Git (CentOS 7)
sudo yum install -y git

# Hoặc CentOS 8/9
sudo dnf install -y git

# Cài PM2 (process manager)
sudo npm install -g pm2
```

---

## 📥 BƯỚC 4: Clone và Setup Bot

```bash
# Tạo thư mục cho bot
cd /home
sudo mkdir -p discord-bot
sudo chown $USER:$USER discord-bot
cd discord-bot

# Clone code từ Git (nếu đã push lên GitHub)
git clone https://github.com/USERNAME/my-discord-bot.git
cd my-discord-bot

# Hoặc upload code bằng SCP/SFTP
# scp -r /path/to/local/my-discord-bot user@server:/home/discord-bot/
```

---

## ⚙️ BƯỚC 5: Cấu hình Bot

```bash
# Cài đặt dependencies
npm install

# Tạo file .env
nano .env
```

Nội dung file `.env`:
```env
BOT_TOKEN=YOUR_BOT_TOKEN_HERE
CLIENT_ID=YOUR_CLIENT_ID_HERE
GUILD_ID=YOUR_GUILD_ID_HERE
```

Lưu file: `Ctrl + O`, `Enter`, `Ctrl + X`

```bash
# Deploy slash commands
npm run deploy

# Hoặc
node deploy-commands.js
```

---

## 🚀 BƯỚC 6: Chạy Bot với PM2

```bash
# Start bot với PM2
pm2 start ecosystem.config.js

# Hoặc nếu không có ecosystem.config.js
pm2 start index.js --name "discord-bot"

# Kiểm tra trạng thái
pm2 status

# Xem logs
pm2 logs discord-bot

# Lưu cấu hình PM2
pm2 save

# Tự động khởi động khi reboot
pm2 startup systemd
# Copy và chạy lệnh mà PM2 in ra
```

---

## 🔒 BƯỚC 7: Cấu hình Firewall (SELinux & Firewalld)

```bash
# Kiểm tra firewall
sudo firewall-cmd --state

# Nếu cần mở port cho web dashboard (tùy chọn)
# sudo firewall-cmd --permanent --add-port=3000/tcp
# sudo firewall-cmd --reload

# Kiểm tra SELinux (nếu bị chặn)
sudo getenforce
# Nếu là "Enforcing" và bot bị lỗi, có thể tạm tắt:
# sudo setenforce 0  # Tạm thời
# Hoặc chỉnh /etc/selinux/config để vĩnh viễn
```

---

## 📊 BƯỚC 8: Monitoring và Management

### Xem logs realtime:
```bash
pm2 logs discord-bot --lines 100
```

### Khởi động lại bot:
```bash
pm2 restart discord-bot
```

### Dừng bot:
```bash
pm2 stop discord-bot
```

### Xóa khỏi PM2:
```bash
pm2 delete discord-bot
```

### Kiểm tra resource usage:
```bash
pm2 monit
```

---

## 🔄 BƯỚC 9: Tự động backup dữ liệu

```bash
# Tạo script backup
nano backup-bot.sh
```

Nội dung:
```bash
#!/bin/bash
BACKUP_DIR="/home/discord-bot/backups"
BOT_DIR="/home/discord-bot/my-discord-bot"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $BOT_DIR/data.json $BACKUP_DIR/data_$DATE.json
cp $BOT_DIR/.env $BACKUP_DIR/env_$DATE.txt

# Xóa backup cũ hơn 7 ngày
find $BACKUP_DIR -name "data_*.json" -mtime +7 -delete
find $BACKUP_DIR -name "env_*.txt" -mtime +7 -delete

echo "✅ Backup completed: $DATE"
```

```bash
# Phân quyền
chmod +x backup-bot.sh

# Thêm vào crontab (backup mỗi ngày lúc 3h sáng)
crontab -e
# Thêm dòng:
0 3 * * * /home/discord-bot/my-discord-bot/backup-bot.sh >> /home/discord-bot/backup.log 2>&1
```

---

## 🔧 Troubleshooting CentOS

### Lỗi: "python: command not found"
```bash
# Tạo symlink
sudo alternatives --set python /usr/bin/python3
# Hoặc
sudo ln -s /usr/bin/python3 /usr/bin/python
```

### Lỗi: "Permission denied" khi chạy bot
```bash
# Fix quyền thư mục
sudo chown -R $USER:$USER /home/discord-bot
chmod -R 755 /home/discord-bot
```

### Lỗi: "Cannot find module 'discord.js'"
```bash
# Cài lại dependencies
cd /home/discord-bot/my-discord-bot
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: Font không hiển thị trong chart
```bash
# Cài font tiếng Việt
sudo yum install -y google-noto-sans-cjk-fonts  # CentOS 7
# Hoặc
sudo dnf install -y google-noto-sans-cjk-fonts  # CentOS 8/9

# Rebuild font cache
fc-cache -f -v
```

### Bot bị crash liên tục:
```bash
# Xem logs chi tiết
pm2 logs discord-bot --err --lines 200

# Tăng memory limit cho PM2
pm2 delete discord-bot
pm2 start ecosystem.config.js --max-memory-restart 500M
```

---

## 📱 Update Bot khi có code mới

```bash
cd /home/discord-bot/my-discord-bot

# Pull code mới
git pull origin main

# Cài dependencies mới (nếu có)
npm install

# Restart bot
pm2 restart discord-bot

# Xem logs để check
pm2 logs discord-bot --lines 50
```

---

## 🎯 Checklist hoàn thành

- [ ] Node.js >= 18.0.0 đã cài
- [ ] Python 3 + Pillow đã cài
- [ ] PM2 đã cài và chạy
- [ ] Code bot đã clone/upload
- [ ] File .env đã tạo với BOT_TOKEN
- [ ] `npm install` thành công
- [ ] `npm run deploy` deploy commands thành công
- [ ] `pm2 start ecosystem.config.js` chạy bot
- [ ] `pm2 save` và `pm2 startup` để auto-start
- [ ] Firewall/SELinux đã cấu hình (nếu cần)
- [ ] Backup script đã setup với cron

---

## 💡 Tips cho CentOS

1. **Luôn update hệ thống:**
   ```bash
   sudo yum update -y  # CentOS 7
   sudo dnf update -y  # CentOS 8/9
   ```

2. **Sử dụng screen/tmux cho debug:**
   ```bash
   sudo yum install -y screen
   screen -S discord-bot
   npm start
   # Detach: Ctrl+A, D
   # Reattach: screen -r discord-bot
   ```

3. **Monitor system resources:**
   ```bash
   htop  # Nếu chưa có: sudo yum install -y htop
   df -h  # Disk usage
   free -m  # Memory usage
   ```

4. **Security best practices:**
   ```bash
   # Tạo user riêng cho bot
   sudo useradd -m -s /bin/bash discordbot
   sudo su - discordbot
   # Chạy tất cả lệnh setup với user này
   ```

---

## 🆘 Cần trợ giúp?

- Xem logs: `pm2 logs discord-bot`
- Check process: `pm2 status`
- System info: `uname -a && cat /etc/redhat-release`
- Node/npm version: `node -v && npm -v`
- Python version: `python3 --version`

---

**✅ Bot đã sẵn sàng chạy 24/7 trên CentOS server!**
