# 🚀 QUICK DEPLOY - Các Lệnh Nhanh

## 📦 Deploy Lên VPS (Ubuntu)

### One-Line Setup:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && \
sudo apt install -y nodejs python3 python3-pip git && \
pip3 install Pillow && \
sudo npm install -g pm2 && \
echo "✅ Setup completed!"
```

### Clone & Run:
```bash
# Clone repository
git clone YOUR_GITHUB_REPO_URL
cd my-discord-bot

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
TOKEN=YOUR_BOT_TOKEN_HERE
CLIENT_ID=YOUR_CLIENT_ID_HERE
GUILD_ID=YOUR_GUILD_ID_HERE
EOF

# Deploy commands
node deploy.js

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🚂 Deploy Lên Railway

### Bước 1: Push lên GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/my-discord-bot.git
git push -u origin main
```

### Bước 2: Trên Railway.app
1. Đăng nhập https://railway.app
2. New Project → Deploy from GitHub
3. Chọn repo `my-discord-bot`
4. Add Variables:
   - `TOKEN` = Bot token
   - `CLIENT_ID` = Client ID
   - `GUILD_ID` = Guild ID
5. Deploy!

---

## 🌊 Deploy Lên Heroku

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create my-discord-bot-taixiu

# Add buildpacks
heroku buildpacks:add --index 1 heroku/python
heroku buildpacks:add --index 2 heroku/nodejs

# Set environment variables
heroku config:set TOKEN=YOUR_BOT_TOKEN
heroku config:set CLIENT_ID=YOUR_CLIENT_ID
heroku config:set GUILD_ID=YOUR_GUILD_ID

# Deploy
git push heroku main

# Scale worker
heroku ps:scale worker=1

# View logs
heroku logs --tail
```

---

## 🔄 Update Bot (Khi Có Code Mới)

### On VPS:
```bash
cd ~/my-discord-bot
git pull
npm install
pm2 restart discord-taixiu-bot
pm2 logs
```

### On Railway:
```bash
# Just push to GitHub
git add .
git commit -m "Update features"
git push

# Railway tự động deploy
```

### On Heroku:
```bash
git push heroku main
```

---

## 📊 Monitoring

### PM2 Commands:
```bash
pm2 status              # Xem status
pm2 logs                # Xem logs realtime
pm2 monit              # Monitor CPU/RAM
pm2 restart all        # Restart tất cả
pm2 stop all           # Stop tất cả
pm2 delete all         # Xóa tất cả
```

### Check Bot:
```bash
# Check process
ps aux | grep node

# Check ports
sudo netstat -tulpn | grep node

# Check RAM usage
free -h

# Check disk space
df -h
```

---

## 🔧 Troubleshooting

### Bot Offline:
```bash
pm2 restart discord-taixiu-bot
pm2 logs --err
```

### Out of Memory:
```bash
# Add swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Commands Not Working:
```bash
node deploy.js
pm2 restart discord-taixiu-bot
```

---

## 💾 Backup

### Manual Backup:
```bash
cp ~/my-discord-bot/data.json ~/data_backup_$(date +%Y%m%d).json
```

### Auto Backup (Cron):
```bash
# Make backup script executable
chmod +x ~/my-discord-bot/backup.sh

# Setup cron
crontab -e

# Add line (backup every 6 hours):
0 */6 * * * ~/my-discord-bot/backup.sh
```

---

## 🔐 Security

### Basic Security:
```bash
# Firewall
sudo ufw allow 22
sudo ufw enable

# Secure .env
chmod 600 .env

# Don't push .env to Git
echo ".env" >> .gitignore
```

---

## 📱 Các Lệnh Thường Dùng

```bash
# Start bot
pm2 start ecosystem.config.js

# Stop bot
pm2 stop discord-taixiu-bot

# Restart bot
pm2 restart discord-taixiu-bot

# Delete bot
pm2 delete discord-taixiu-bot

# View logs
pm2 logs discord-taixiu-bot

# Clear logs
pm2 flush

# Save process list
pm2 save

# Restore saved processes
pm2 resurrect
```

---

## 🎯 Best Practices

1. ✅ **Always backup data.json** trước khi update
2. ✅ **Test local** trước khi push lên server
3. ✅ **Monitor logs** trong 24h đầu sau deploy
4. ✅ **Setup auto-restart** với PM2
5. ✅ **Keep secrets safe** - Không push .env lên Git

---

**Happy Deploying! 🚀**
