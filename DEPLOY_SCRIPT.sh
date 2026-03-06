#!/bin/bash
# Script deploy bot lên CentOS server
# Chạy script này TRÊN SERVER sau khi SSH vào

echo "🚀 Bắt đầu deploy Discord Bot..."

# 1. Cài Node.js 18
echo "📦 Cài đặt Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 2. Cài Python + Pillow
echo "🐍 Cài đặt Python và Pillow..."
sudo yum install -y python3 python3-pip python3-devel
sudo yum install -y libjpeg-devel zlib-devel freetype-devel lcms2-devel openjpeg2-devel libtiff-devel
pip3 install --user Pillow

# 3. Cài Git và PM2
echo "📦 Cài đặt Git và PM2..."
sudo yum install -y git
sudo npm install -g pm2

# 4. Clone code từ GitHub
echo "📥 Clone code từ GitHub..."
cd /root
if [ -d "BOTFM" ]; then
    echo "⚠️ Thư mục BOTFM đã tồn tại, xóa và clone lại..."
    rm -rf BOTFM
fi
git clone https://github.com/PhamDuy9999/BOTFM.git
cd BOTFM

# 5. Cài dependencies
echo "📦 Cài đặt npm packages..."
npm install

# 6. Yêu cầu nhập token
echo ""
echo "⚙️ Cần tạo file .env với thông tin bot..."
echo "Nhập BOT_TOKEN:"
read BOT_TOKEN
echo "Nhập CLIENT_ID:"
read CLIENT_ID
echo "Nhập GUILD_ID:"
read GUILD_ID

# Tạo file .env
cat > .env << EOF
BOT_TOKEN=$BOT_TOKEN
CLIENT_ID=$CLIENT_ID
GUILD_ID=$GUILD_ID
EOF

echo "✅ File .env đã được tạo!"

# 7. Deploy commands
echo "📤 Deploy slash commands..."
node deploy.js

# 8. Start bot với PM2
echo "🚀 Khởi động bot với PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd

echo ""
echo "✅ Deploy hoàn tất!"
echo ""
echo "📊 Kiểm tra trạng thái bot:"
pm2 status
echo ""
echo "📝 Xem logs:"
echo "pm2 logs discord-taixiu-bot"
echo ""
echo "🔄 Khởi động lại bot:"
echo "pm2 restart discord-taixiu-bot"
echo ""
echo "🛑 Dừng bot:"
echo "pm2 stop discord-taixiu-bot"
