# 🚀 HƯỚNG DẪN DEPLOY BOT LÊN SERVER

## 📋 Mục Lục
1. [Chuẩn Bị](#1-chuẩn-bị)
2. [Deploy Lên VPS](#2-deploy-lên-vps)
3. [Deploy Lên Hosting](#3-deploy-lên-hosting)
4. [Deploy Lên Cloud (Railway/Heroku)](#4-deploy-lên-cloud)
5. [PM2 Setup](#5-pm2-setup)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Chuẩn Bị

### ✅ Checklist Trước Khi Deploy:

```bash
# 1. Check bot hoạt động local
npm start

# 2. Check tất cả dependencies
npm install

# 3. Check Python + Pillow (cho chart)
python3 --version
pip3 list | grep Pillow

# 4. Check file .env
cat .env  # Phải có TOKEN, CLIENT_ID, GUILD_ID
```

### 📁 Files Cần Thiết:
```
my-discord-bot/
├── index.js          ✅ Main bot file
├── game.js           ✅ Game logic
├── embeds.js         ✅ UI components
├── database.js       ✅ Data persistence
├── utils.js          ✅ Helper functions
├── chart.js          ✅ Chart wrapper
├── chart_gen.py      ✅ Python chart generator
├── deploy.js         ✅ Deploy commands
├── package.json      ✅ Dependencies
├── .env              ✅ Environment variables
├── data.json         ✅ Database (tự tạo)
└── node_modules/     ✅ Auto install
```

---

## 2. Deploy Lên VPS (Ubuntu/Debian)

### Bước 1: Thuê VPS

**Nhà cung cấp:**
- DigitalOcean ($5-10/tháng)
- Vultr ($5/tháng)
- Linode ($5/tháng)
- AWS EC2 (Free tier 12 tháng)
- Google Cloud (Free $300 credit)

**Yêu cầu tối thiểu:**
- RAM: 512MB (khuyến nghị 1GB)
- CPU: 1 core
- Storage: 10GB
- OS: Ubuntu 20.04/22.04 LTS

---

### Bước 2: Kết Nối VPS

```bash
# SSH vào VPS
ssh root@YOUR_VPS_IP

# Hoặc với key
ssh -i ~/.ssh/your_key.pem root@YOUR_VPS_IP
```

---

### Bước 3: Setup Server

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Cài Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Check version
node -v    # v18.x.x
npm -v     # 9.x.x

# 4. Cài Python 3 + pip
sudo apt install -y python3 python3-pip

# 5. Cài Pillow cho chart
pip3 install Pillow

# 6. Cài Git
sudo apt install -y git

# 7. Cài PM2 (quản lý process)
sudo npm install -g pm2
```

---

### Bước 4: Upload Code Lên Server

**Option 1: Dùng Git (Khuyến nghị)**

```bash
# Trên máy local - Push code lên GitHub
cd /Users/phamduy/my-discord-bot
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/my-discord-bot.git
git push -u origin main

# Trên VPS - Clone code về
cd ~
git clone https://github.com/YOUR_USERNAME/my-discord-bot.git
cd my-discord-bot
```

**Option 2: Dùng SCP (Upload trực tiếp)**

```bash
# Trên máy local
cd /Users/phamduy
scp -r my-discord-bot root@YOUR_VPS_IP:/root/

# Hoặc nén trước
tar -czf bot.tar.gz my-discord-bot/
scp bot.tar.gz root@YOUR_VPS_IP:/root/

# Trên VPS - Giải nén
cd ~
tar -xzf bot.tar.gz
```

**Option 3: Dùng SFTP**

```bash
# Dùng FileZilla/Cyberduck
# Host: YOUR_VPS_IP
# Username: root
# Password: YOUR_PASSWORD
# Port: 22
# Upload folder my-discord-bot/
```

---

### Bước 5: Setup Environment

```bash
# Trên VPS
cd ~/my-discord-bot

# Tạo file .env
nano .env

# Paste nội dung:
TOKEN=YOUR_DISCORD_BOT_TOKEN
CLIENT_ID=YOUR_CLIENT_ID
GUILD_ID=YOUR_GUILD_ID

# Ctrl+X, Y, Enter để save
```

---

### Bước 6: Cài Dependencies

```bash
cd ~/my-discord-bot
npm install
```

---

### Bước 7: Deploy Commands

```bash
node deploy.js

# Output:
# 🔄 Đang deploy slash commands...
# ✅ Deploy thành công 16 lệnh!
```

---

### Bước 8: Chạy Bot Với PM2

```bash
# Start bot
pm2 start index.js --name discord-bot

# Check status
pm2 status

# Xem logs
pm2 logs discord-bot

# Stop bot
pm2 stop discord-bot

# Restart bot
pm2 restart discord-bot

# Delete bot
pm2 delete discord-bot
```

---

### Bước 9: Auto Start Khi Server Reboot

```bash
# Save PM2 process list
pm2 save

# Setup startup script
pm2 startup

# Copy paste command output và chạy
# VD: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

---

## 3. Deploy Lên Hosting (Shared Hosting)

### ⚠️ Lưu Ý:
- Shared hosting thường **không hỗ trợ** Node.js bot 24/7
- Cần hosting hỗ trợ:
  - Node.js
  - Persistent processes
  - Port binding (hoặc không cần nếu bot không có web server)

### Hosting Khuyến Nghị:
- ❌ **Không dùng:** cPanel shared hosting
- ✅ **Dùng:** Hostinger VPS, A2 Hosting VPS
- ✅ **Tốt nhất:** VPS hoặc Cloud

---

## 4. Deploy Lên Cloud

### 🚂 Railway (Khuyến nghị - Free tier)

**Bước 1:** Tạo tài khoản https://railway.app

**Bước 2:** Push code lên GitHub (như phần 2)

**Bước 3:** Trên Railway
```
1. New Project → Deploy from GitHub repo
2. Chọn repo my-discord-bot
3. Add variables:
   - TOKEN = YOUR_BOT_TOKEN
   - CLIENT_ID = YOUR_CLIENT_ID
   - GUILD_ID = YOUR_GUILD_ID
4. Deploy!
```

**Bước 4:** Setup Python buildpack
```
Tạo file railway.json:
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Bước 5:** Tạo nixpacks.toml
```toml
[phases.setup]
nixPkgs = ['python3', 'python3Packages.pip']

[phases.install]
cmds = [
  'pip3 install Pillow',
  'npm install'
]

[start]
cmd = 'npm start'
```

---

### 🌊 Heroku (Paid - $7/tháng)

**Bước 1:** Tạo file Procfile
```
worker: node index.js
```

**Bước 2:** Tạo requirements.txt
```
Pillow==10.0.0
```

**Bước 3:** Deploy
```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku  # macOS

# Login
heroku login

# Create app
heroku create my-discord-bot

# Add Python buildpack
heroku buildpacks:add --index 1 heroku/python
heroku buildpacks:add --index 2 heroku/nodejs

# Set env vars
heroku config:set TOKEN=YOUR_TOKEN
heroku config:set CLIENT_ID=YOUR_CLIENT_ID
heroku config:set GUILD_ID=YOUR_GUILD_ID

# Push
git push heroku main

# Scale worker
heroku ps:scale worker=1
```

---

### ☁️ Google Cloud / AWS

**Google Cloud:**
```bash
# 1. Tạo VM instance
gcloud compute instances create discord-bot \
  --machine-type=e2-micro \
  --zone=us-central1-a

# 2. SSH vào
gcloud compute ssh discord-bot

# 3. Setup như VPS (phần 2)
```

**AWS EC2:**
```bash
# 1. Launch EC2 instance (t2.micro)
# 2. Download key pair
# 3. SSH vào
ssh -i "key.pem" ubuntu@ec2-xx-xx-xx-xx.compute-1.amazonaws.com

# 4. Setup như VPS (phần 2)
```

---

## 5. PM2 Setup Chi Tiết

### Tạo ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'discord-bot',
    script: './index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

### Dùng ecosystem.config.js

```bash
# Start
pm2 start ecosystem.config.js

# Monitoring
pm2 monit

# Logs
pm2 logs --lines 100

# Restart khi update code
pm2 restart discord-bot

# Reload (zero downtime)
pm2 reload discord-bot
```

---

## 6. Update Bot Trên Server

### Method 1: Git Pull (Khuyến nghị)

```bash
# Trên local - Push changes
git add .
git commit -m "Update features"
git push

# Trên server - Pull và restart
cd ~/my-discord-bot
git pull
npm install  # Nếu có dependencies mới
pm2 restart discord-bot
```

### Method 2: SCP Upload

```bash
# Trên local
scp index.js root@YOUR_VPS_IP:/root/my-discord-bot/

# Trên server
pm2 restart discord-bot
```

---

## 7. Monitoring & Logging

### PM2 Logs

```bash
# Xem logs realtime
pm2 logs discord-bot

# Xem 100 dòng cuối
pm2 logs discord-bot --lines 100

# Clear logs
pm2 flush

# Save logs to file
pm2 logs discord-bot > bot.log
```

### Tạo thư mục logs

```bash
mkdir ~/my-discord-bot/logs

# Logs sẽ tự động lưu vào:
# - logs/out.log (stdout)
# - logs/err.log (stderr)
```

---

## 8. Security Best Practices

### 1️⃣ Tạo User Riêng (Không dùng root)

```bash
# Tạo user
sudo adduser discordbot
sudo usermod -aG sudo discordbot

# Switch user
su - discordbot

# Chạy bot với user này
pm2 start index.js --name discord-bot
```

### 2️⃣ Setup Firewall

```bash
# UFW firewall
sudo ufw allow 22      # SSH
sudo ufw enable
sudo ufw status
```

### 3️⃣ Bảo vệ .env

```bash
# Set permissions
chmod 600 .env

# Không push .env lên Git
echo ".env" >> .gitignore
```

---

## 9. Backup Data

### Auto Backup Script

```bash
# Tạo backup.sh
nano ~/backup.sh

# Paste:
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cd ~/my-discord-bot
cp data.json ~/backups/data_$DATE.json
# Xóa backups cũ hơn 7 ngày
find ~/backups/ -name "data_*.json" -mtime +7 -delete

# Chmod
chmod +x ~/backup.sh

# Cron job - backup mỗi 6 giờ
crontab -e
# Thêm dòng:
0 */6 * * * ~/backup.sh
```

---

## 10. Troubleshooting

### ❌ Bot không online

```bash
# Check process
pm2 status

# Check logs
pm2 logs discord-bot --err

# Restart
pm2 restart discord-bot

# Check port conflicts
sudo netstat -tulpn | grep node
```

### ❌ Python chart không hoạt động

```bash
# Check Python
python3 --version

# Check Pillow
pip3 show Pillow

# Reinstall
pip3 install --upgrade Pillow

# Check font paths
ls /usr/share/fonts/truetype/
```

### ❌ Out of memory

```bash
# Check RAM
free -h

# Increase swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### ❌ Commands không deploy

```bash
# Re-deploy
node deploy.js

# Check token
cat .env

# Check permissions
# Bot phải có Application Commands permission
```

---

## 11. Chi Phí Ước Tính

| Service | Giá | RAM | Bandwidth | Note |
|---------|-----|-----|-----------|------|
| **Railway** | Free → $5/tháng | 512MB-8GB | Unlimited | ✅ Khuyến nghị cho newbie |
| **DigitalOcean** | $6/tháng | 1GB | 1TB | ✅ Stable, dễ dùng |
| **Vultr** | $5/tháng | 1GB | 1TB | ✅ Nhiều location |
| **Heroku** | $7/tháng | 512MB | Unlimited | ⚠️ Đắt hơn |
| **AWS Free Tier** | Free 12 tháng | 1GB | 15GB/tháng | ⚠️ Phức tạp |
| **GCP** | $300 credit | Flexible | Flexible | ⚠️ Phức tạp |

---

## 12. Quick Start Commands

### Deploy Lần Đầu:
```bash
# 1. SSH vào server
ssh root@YOUR_VPS_IP

# 2. Setup
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs python3 python3-pip git
pip3 install Pillow
sudo npm install -g pm2

# 3. Clone code
git clone YOUR_REPO_URL
cd my-discord-bot
npm install

# 4. Setup .env
nano .env  # Paste TOKEN, CLIENT_ID, GUILD_ID

# 5. Deploy commands
node deploy.js

# 6. Start bot
pm2 start index.js --name discord-bot
pm2 save
pm2 startup
```

### Update Bot:
```bash
cd ~/my-discord-bot
git pull
npm install
pm2 restart discord-bot
```

### Check Status:
```bash
pm2 status
pm2 logs discord-bot
```

---

## 📞 Support

**Nếu gặp vấn đề:**
1. Check PM2 logs: `pm2 logs discord-bot`
2. Check system: `free -h`, `df -h`
3. Restart bot: `pm2 restart discord-bot`
4. Check Discord status: https://status.discord.com/

---

## ✅ Checklist Deploy

- [ ] Bot chạy OK trên local
- [ ] Push code lên GitHub
- [ ] Thuê VPS/Cloud
- [ ] SSH vào server
- [ ] Cài Node.js, Python, PM2
- [ ] Clone code về server
- [ ] Setup .env
- [ ] npm install
- [ ] node deploy.js
- [ ] pm2 start
- [ ] pm2 save + startup
- [ ] Test bot trong Discord
- [ ] Setup backup script
- [ ] Monitor logs 24h đầu

---

**🎉 Xong! Bot đã lên server và chạy 24/7!** 🚀✨
