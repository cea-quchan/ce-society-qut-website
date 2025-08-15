#!/bin/bash

# این اسکریپت برای راه‌اندازی اولیه مخزن در سیستم محلی و پوش به GitHub طراحی شده است.
# متغیرهای زیر را در صورت نیاز تغییر دهید.

PROJECT_DIR="E:/root2"         # مسیر پوشهٔ پروژه روی سیستم ویندوز شما
GITHUB_USERNAME="cea-quchan"   # نام کاربری شما در GitHub
REPO_NAME="ce-society-qut-website"  # نام مخزن جدید در GitHub
USE_SSH=0                       # اگر کلید SSH تنظیم کرده‌اید مقدار 1 را قرار دهید

# حرکت به پوشهٔ پروژه
cd "$PROJECT_DIR" || {
  echo "❌ مسیر $PROJECT_DIR یافت نشد. لطفاً PROJECT_DIR را به مسیر صحیح تغییر دهید.";
  exit 1;
}

echo "✅ در پوشهٔ پروژه: $PROJECT_DIR"

# مقداردهی اولیه گیت اگر لازم باشد
if [ ! -d .git ]; then
  git init
  echo "🧰 مخزن گیت ایجاد شد."
fi

# اگر فایل‌های الگو (مثل README و غیره) را در کنار پروژه کپی کرده‌اید، همه را اضافه می‌کنیم
git add .
git commit -m "chore: bootstrap QUT CE Society website repo" || true

# تغییر نام شاخهٔ اصلی به main
git branch -M main

# اضافه کردن ریموت
REMOTE_URL=""
if [ "$USE_SSH" -eq 1 ]; then
  REMOTE_URL="git@github.com:${GITHUB_USERNAME}/${REPO_NAME}.git"
else
  REMOTE_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
fi

if git remote | grep -q '^origin$'; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

echo "🌐 ریموت origin تنظیم شد: $REMOTE_URL"

# پوش به ریموت
git push -u origin main || {
  echo "⚠️ push اولیه با خطا مواجه شد. اگر مخزن از قبل فایل دارد، pull با rebase انجام می‌دهیم...";
  git pull --rebase origin main --allow-unrelated-histories || true;
  git push -u origin main;
}

echo "🎉 عملیات پوش کامل شد!"