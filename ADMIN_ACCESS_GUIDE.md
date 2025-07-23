# راهنمای دسترسی به پنل مدیریت - Admin Panel Access Guide

## 🚀 راه‌اندازی سریع سیستم - Quick System Setup

### 1. نصب وابستگی‌ها - Install Dependencies
```bash
npm install
```

### 2. راه‌اندازی سیستم‌ها - Initialize Systems
```bash
node scripts/operationalize-systems.js
```

### 3. شروع سرور - Start Server
```bash
npm run dev
```

## 🔐 اطلاعات ورود به پنل مدیریت - Admin Panel Login

### حساب کاربری مدیر - Admin Account
- **ایمیل:** admin@example.com
- **رمز عبور:** admin123456
- **نقش:** ADMIN

### آدرس پنل مدیریت - Admin Panel URL
```
http://localhost:3000/dashboard
```

## 📋 لیست کامل سیستم‌های عملیاتی - Complete Operational Systems List

### 🔐 سیستم احراز هویت - Authentication System
- ✅ NextAuth.js integration
- ✅ JWT token management
- ✅ Role-based access control (ADMIN, TEACHER, STUDENT)
- ✅ Session management
- ✅ Password hashing with bcryptjs

### 👥 مدیریت کاربران - User Management
- ✅ ایجاد، ویرایش و حذف کاربران
- ✅ مدیریت نقش‌ها و دسترسی‌ها
- ✅ پروفایل کاربری
- ✅ فعال/غیرفعال کردن حساب‌ها

### 📚 مدیریت دوره‌ها - Course Management
- ✅ ایجاد و ویرایش دوره‌ها
- ✅ مدیریت درس‌ها و محتوا
- ✅ ثبت‌نام دانشجویان
- ✅ پیشرفت یادگیری

### 📰 مدیریت مقالات - Article Management
- ✅ انتشار مقالات
- ✅ مدیریت دسته‌بندی‌ها
- ✅ ویرایشگر محتوا
- ✅ SEO optimization

### 🏆 مدیریت مسابقات - Competition Management
- ✅ ایجاد مسابقات
- ✅ مدیریت شرکت‌کنندگان
- ✅ اعلام برندگان
- ✅ سیستم امتیازدهی

### 📅 مدیریت رویدادها - Event Management
- ✅ برنامه‌ریزی رویدادها
- ✅ ثبت‌نام شرکت‌کنندگان
- ✅ مدیریت ظرفیت
- ✅ ارسال اعلان‌ها

### 🖼️ مدیریت گالری - Gallery Management
- ✅ آپلود تصاویر
- ✅ مدیریت آلبوم‌ها
- ✅ ویرایش تصاویر
- ✅ بهینه‌سازی فایل‌ها

### 📚 مدیریت کتابخانه - Library Management
- ✅ آپلود فایل‌ها
- ✅ دسته‌بندی منابع
- ✅ جستجوی پیشرفته
- ✅ دانلود فایل‌ها

### 🎧 مدیریت پادکست‌ها - Podcast Management
- ✅ آپلود فایل‌های صوتی
- ✅ مدیریت اپیزودها
- ✅ پخش آنلاین
- ✅ دانلود فایل‌ها

### ❓ مدیریت آزمون‌ها - Quiz Management
- ✅ ایجاد آزمون‌ها
- ✅ مدیریت سوالات
- ✅ تصحیح خودکار
- ✅ گزارش‌گیری

### 💰 مدیریت پرداخت‌ها - Payment Management
- ✅ درگاه پرداخت
- ✅ مدیریت تراکنش‌ها
- ✅ گزارش مالی
- ✅ بازگشت وجه

### 📊 تحلیل‌ها و گزارش‌ها - Analytics & Reports
- ✅ آمار کاربران
- ✅ گزارش فروش
- ✅ تحلیل عملکرد
- ✅ نمودارهای تعاملی

### 🔔 سیستم اعلان‌ها - Notification System
- ✅ اعلان‌های درون‌برنامه‌ای
- ✅ ایمیل‌های خودکار
- ✅ تنظیمات اعلان‌ها
- ✅ تاریخچه اعلان‌ها

### 💬 سیستم پیام‌رسانی - Messaging System
- ✅ چت خصوصی
- ✅ گروه‌های چت
- ✅ ارسال فایل
- ✅ تاریخچه پیام‌ها

### 🔧 تنظیمات سیستم - System Settings
- ✅ تنظیمات عمومی
- ✅ تنظیمات امنیتی
- ✅ پشتیبان‌گیری
- ✅ بازیابی داده‌ها

## 🎨 ویژگی‌های رابط کاربری - UI Features

### 🎯 طراحی مدرن - Modern Design
- ✅ تم تاریک/روشن
- ✅ طراحی واکنش‌گرا
- ✅ انیمیشن‌های نرم
- ✅ رابط کاربری شهودی

### 📱 سازگاری موبایل - Mobile Responsive
- ✅ طراحی موبایل-اول
- ✅ ناوبری لمسی
- ✅ بهینه‌سازی عملکرد
- ✅ PWA support

### 🌐 چندزبانه - Multi-language
- ✅ فارسی و انگلیسی
- ✅ تغییر زبان پویا
- ✅ ترجمه‌های کامل
- ✅ RTL support

## 🔧 تنظیمات پیشرفته - Advanced Configuration

### متغیرهای محیطی - Environment Variables
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=educational_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# Authentication
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-session-key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment
PAYMENT_GATEWAY=zarinpal
MERCHANT_ID=your-merchant-id
PAYMENT_CALLBACK_URL=http://localhost:3000/api/payment/verify
```

### دستورات مفید - Useful Commands
```bash
# نصب وابستگی‌ها
npm install

# شروع سرور توسعه
npm run dev

# ساخت نسخه تولید
npm run build

# شروع سرور تولید
npm start

# اجرای تست‌ها
npm test

# بررسی کد
npm run lint

# ترمیم کد
npm run lint:fix

# مهاجرت پایگاه داده
npm run db:migrate

# پر کردن پایگاه داده
npm run db:seed

# پشتیبان‌گیری
npm run backup

# بازیابی
npm run restore
```

## 🚨 عیب‌یابی - Troubleshooting

### مشکلات رایج - Common Issues

#### 1. خطای اتصال به پایگاه داده
```bash
# بررسی وضعیت پایگاه داده
npm run db:status

# راه‌اندازی مجدد پایگاه داده
npm run db:reset
```

#### 2. خطای احراز هویت
```bash
# پاک کردن کش
npm run cache:clear

# راه‌اندازی مجدد سرور
npm run dev
```

#### 3. مشکل آپلود فایل
```bash
# بررسی مجوزهای پوشه
chmod 755 uploads/

# بررسی فضای دیسک
df -h
```

## 📞 پشتیبانی - Support

### اطلاعات تماس - Contact Information
- **ایمیل:** support@example.com
- **تلگرام:** @support_bot
- **واتساپ:** +98-xxx-xxx-xxxx

### منابع مفید - Useful Resources
- 📖 [مستندات API](http://localhost:3000/api/docs)
- 🎥 [ویدیوهای آموزشی](http://localhost:3000/tutorials)
- 💬 [انجمن کاربران](http://localhost:3000/forum)
- 📚 [کتابخانه مستندات](http://localhost:3000/docs)

## 🔄 به‌روزرسانی سیستم - System Updates

### بررسی به‌روزرسانی‌ها
```bash
# بررسی نسخه‌های جدید
npm outdated

# به‌روزرسانی وابستگی‌ها
npm update

# به‌روزرسانی کامل
npm audit fix
```

### نسخه‌های سیستم
- **نسخه فعلی:** 1.0.0
- **آخرین به‌روزرسانی:** 2024-01-15
- **وضعیت:** پایدار

---

## 🎉 تبریک! سیستم شما آماده است

پس از پیروی از این راهنما، شما قادر خواهید بود:
- ✅ وارد پنل مدیریت شوید
- ✅ تمام سیستم‌ها را مدیریت کنید
- ✅ کاربران و محتوا را کنترل کنید
- ✅ گزارش‌های کامل دریافت کنید
- ✅ سیستم را شخصی‌سازی کنید

**نکته مهم:** همیشه از رمزهای عبور قوی استفاده کنید و تنظیمات امنیتی را بررسی کنید. 