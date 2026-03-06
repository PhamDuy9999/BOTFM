#!/bin/bash

# ==============================================
# DISCORD BOT BACKUP SCRIPT
# ==============================================

# Configuration
BOT_DIR="/root/my-discord-bot"
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=7

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Discord Bot Backup ===${NC}"
echo "Time: $(date)"
echo "---"

# Create backup directory if not exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}Creating backup directory...${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Backup data.json
if [ -f "$BOT_DIR/data.json" ]; then
    echo -e "${GREEN}Backing up data.json...${NC}"
    cp "$BOT_DIR/data.json" "$BACKUP_DIR/data_$DATE.json"
    echo "✓ Saved to: $BACKUP_DIR/data_$DATE.json"
else
    echo -e "${RED}✗ data.json not found!${NC}"
fi

# Backup .env (optional - be careful with secrets!)
# if [ -f "$BOT_DIR/.env" ]; then
#     echo -e "${GREEN}Backing up .env...${NC}"
#     cp "$BOT_DIR/.env" "$BACKUP_DIR/env_$DATE.txt"
# fi

# Count backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/data_*.json 2>/dev/null | wc -l)
echo "Total backups: $BACKUP_COUNT"

# Delete old backups (older than KEEP_DAYS)
echo -e "${YELLOW}Cleaning old backups (>$KEEP_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "data_*.json" -mtime +$KEEP_DAYS -delete
DELETED=$?

if [ $DELETED -eq 0 ]; then
    echo "✓ Cleanup completed"
else
    echo -e "${RED}✗ Cleanup failed${NC}"
fi

echo "---"
echo -e "${GREEN}Backup completed!${NC}"
echo ""

# Optional: Compress old backups
# find "$BACKUP_DIR" -name "data_*.json" -mtime +1 -exec gzip {} \;
