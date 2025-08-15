# تنظیمات
$PROJECT_DIR = "E:\root2"
$GITHUB_USER = "cea-quchan"
$REPO_NAME   = "ce-society-qut-website"

# هویت خودتان در گیت (مقداردهی کنید)
git config --global user.name "Ali Kheiri"
git config --global user.email "your_email@example.com"

# رفع مشکل مالکیت مشکوک
git config --global --add safe.directory $PROJECT_DIR

# رفتن به پوشه پروژه
Set-Location $PROJECT_DIR

# مقداردهی اولیه گیت و کامیت
git init
git add .
git commit -m "chore: bootstrap QUT CE Society website repo" -q

# تعیین برنچ اصلی
git branch -M main

# اضافه یا به‌روزرسانی ریموت origin
if ((git remote) -contains "origin") {
    git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
} else {
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
}

# پوش به ریموت
git push -u origin main
