#!/usr/bin/env python3
"""
chart_gen.py — Vẽ biểu đồ lịch sử phiên Tài Xỉu
Cách dùng: python3 chart_gen.py <input_json> <output_png>
"""
import sys, json, os
from PIL import Image, ImageDraw, ImageFont

# ── Đọc args ───────────────────────────────────────────
if len(sys.argv) < 3:
    print("Usage: chart_gen.py <input.json> <output.png>")
    sys.exit(1)

with open(sys.argv[1], "r", encoding="utf-8") as f:
    payload = json.load(f)

history   = payload.get("history", [])
round_num = payload.get("round", 1)
out_path  = sys.argv[2]

# ── Fonts ──────────────────────────────────────────────
# Hỗ trợ cả Linux và macOS
import platform

SYSTEM = platform.system()

if SYSTEM == "Darwin":  # macOS
    FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
    FONT_REG  = "/System/Library/Fonts/Supplemental/Arial.ttf"
elif SYSTEM == "Linux":
    FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    FONT_REG  = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
else:  # Windows hoặc khác
    FONT_BOLD = "arial.ttf"
    FONT_REG  = "arial.ttf"

def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        # Fallback: Thử Arial trên Windows
        try:
            return ImageFont.truetype("arial.ttf", size)
        except:
            return ImageFont.load_default()

f_title  = font(FONT_BOLD, 26)
f_info   = font(FONT_BOLD, 15)
f_label  = font(FONT_BOLD, 13)
f_small  = font(FONT_REG,  12)
f_dot    = font(FONT_BOLD, 12)

# ── Canvas ─────────────────────────────────────────────
W, H = 940, 590
img  = Image.new("RGB", (W, H), (12, 16, 42))
draw = ImageDraw.Draw(img, "RGBA")

# Background gradient
for y in range(H):
    t = y / H
    draw.line([(0, y), (W, y)], fill=(
        int(12 + t * 10),
        int(16 + t * 14),
        int(42 + t * 28)
    ))

# ── Helper: draw rounded rect with fill + outline ──────
def rrect(box, r=14, fill=None, outline=None, width=1):
    draw.rounded_rectangle(box, radius=r, fill=fill)
    if outline:
        draw.rounded_rectangle(box, radius=r, outline=outline, width=width)

# ══════════════════════════════════════════════════════════
# TITLE BAR
# ══════════════════════════════════════════════════════════
rrect([18, 12, W-18, 64], r=24, fill=(72, 18, 128), outline=(150, 60, 210), width=2)
draw.text((W//2, 38), "Lịch Sử Phiên", font=f_title, fill=(255, 255, 255), anchor="mm")

# ── Latest round info ──────────────────────────────────
if history:
    last = history[-1]
    dice_str   = "-".join(map(str, last.get("dice", [])))
    result_str = "Tài" if last["result"] == "tai" else "Xỉu"
    info = f"Phiên gần nhất: #{last['round']}      {result_str} ({dice_str})"
else:
    info = "Chưa có dữ liệu phiên nào"

draw.text((W//2, 82), info, font=f_info, fill=(200, 200, 255), anchor="mm")

# ══════════════════════════════════════════════════════════
# CHART 1 — Đường tổng điểm
# ══════════════════════════════════════════════════════════
C1X, C1Y, C1W, C1H = 58, 105, W - 78, 205

rrect([C1X-10, C1Y-10, C1X+C1W+10, C1Y+C1H+14], r=14,
      fill=(18, 22, 60), outline=(55, 55, 115), width=2)

# Y axis gridlines & labels (3,6,9,12,15,18)
for yi in range(3, 19, 3):
    py = int(C1Y + C1H - (yi / 18) * C1H)
    draw.line([(C1X, py), (C1X + C1W, py)], fill=(42, 48, 90), width=1)
    draw.text((C1X - 12, py), str(yi), font=f_small, fill=(120, 130, 195), anchor="rm")

if not history:
    draw.text((C1X + C1W//2, C1Y + C1H//2),
              "Chưa có dữ liệu", font=f_info, fill=(140, 140, 190), anchor="mm")
else:
    n      = len(history)
    step   = C1W / max(n - 1, 1)
    totals  = [h["total"] for h in history]
    results = [h["result"] for h in history]

    pts = []
    for i, v in enumerate(totals):
        px = int(C1X + i * step)
        py = int(C1Y + C1H - (v / 18) * C1H)
        pts.append((px, py))

    # Shadow
    for i in range(len(pts) - 1):
        draw.line([(pts[i][0]+2, pts[i][1]+3), (pts[i+1][0]+2, pts[i+1][1]+3)],
                  fill=(0, 0, 0, 100), width=4)
    # Line
    for i in range(len(pts) - 1):
        draw.line([pts[i], pts[i+1]], fill=(155, 210, 255), width=2)

    # Dots
    for i, (px, py) in enumerate(pts):
        is_tai  = results[i] == "tai"
        col     = (225, 58, 58) if is_tai else (55, 145, 240)
        glow    = (255, 110, 110) if is_tai else (110, 190, 255)
        r       = 12

        # Glow halo
        draw.ellipse([px-r-4, py-r-4, px+r+4, py+r+4], fill=(*col[:3], 55))
        # Circle fill
        draw.ellipse([px-r, py-r, px+r, py+r], fill=col, outline=(255, 255, 255), width=2)
        # Number
        draw.text((px, py), str(totals[i]), font=f_dot, fill=(255, 255, 255), anchor="mm")

# ══════════════════════════════════════════════════════════
# CHART 2 — Scatter 3 xúc xắc
# ══════════════════════════════════════════════════════════
C2X, C2Y, C2W, C2H = 58, 335, W - 78, 170

rrect([C2X-10, C2Y-10, C2X+C2W+10, C2Y+C2H+52], r=14,
      fill=(18, 22, 60), outline=(55, 55, 115), width=2)

# Y axis
for yi in range(1, 7):
    py = int(C2Y + C2H - ((yi - 1) / 5) * C2H)
    draw.line([(C2X, py), (C2X + C2W, py)], fill=(42, 48, 90), width=1)
    draw.text((C2X - 12, py), str(yi), font=f_small, fill=(120, 130, 195), anchor="rm")

DICE_COLORS = [(215, 60, 60), (225, 162, 28), (175, 65, 228)]

if history:
    n     = len(history)
    step2 = C2W / max(n - 1, 1)

    for di in range(3):
        pts2 = []
        for i, h in enumerate(history):
            px = int(C2X + i * step2)
            dv = h["dice"][di] if "dice" in h and len(h["dice"]) > di else 1
            py = int(C2Y + C2H - ((dv - 1) / 5) * C2H)
            pts2.append((px, py))

        col = DICE_COLORS[di]
        for i in range(len(pts2) - 1):
            draw.line([pts2[i], pts2[i+1]], fill=col, width=2)
        for px, py in pts2:
            draw.ellipse([px-7, py-7, px+7, py+7], fill=col, outline=(255, 255, 255), width=1)

# ── Legend buttons ─────────────────────────────────────
LEGEND_Y = C2Y + C2H + 26
LABELS   = ["XÍ NGẦU 1", "XÍ NGẦU 2", "XÍ NGẦU 3"]
for i, lbl in enumerate(LABELS):
    lx  = 195 + i * 252
    col = DICE_COLORS[i]

    # Button
    rrect([lx - 78, LEGEND_Y - 16, lx + 78, LEGEND_Y + 16],
          r=14, fill=col, outline=(255, 255, 255, 60), width=1)

    # Checkmark circle
    cx = lx + 58
    draw.ellipse([cx - 10, LEGEND_Y - 9, cx + 10, LEGEND_Y + 9],
                 fill=(255, 255, 255))
    draw.text((cx, LEGEND_Y), "✓", font=f_small, fill=col, anchor="mm")

    draw.text((lx - 8, LEGEND_Y), lbl, font=f_label, fill=(255, 255, 255), anchor="mm")

# ── Save ───────────────────────────────────────────────
img.save(out_path)
print(f"Chart saved: {out_path}")
