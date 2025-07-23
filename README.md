# Educational Platform

A modern educational platform built with Next.js, Material-UI, and TypeScript.

## Features

- Multi-role support (Admin, Teacher, Student)
- Real-time notifications
- Course management
- Article management
- User management
- Responsive design
- Dark/Light theme support
- Internationalization (Persian/English)

## Tech Stack

- Next.js 14
- TypeScript
- Material-UI
- React Query
- Next Auth
- Emotion
- React Hot Toast

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/educational-platform.git
cd educational-platform
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add the following environment variables:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── components/        # Shared components
├── context/          # React context providers
├── hooks/            # Custom hooks
├── pages/            # Next.js pages
│   ├── api/         # API routes
│   └── dashboard/   # Dashboard pages
├── styles/          # Global styles and theme
└── types/           # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Material-UI](https://mui.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [Vercel](https://vercel.com/) 

## ⚠️ یادداشت مهم درباره صفحات لاگین و ثبت‌نام (Login & Register)

در سیزن دو، صفحات لاگین و ثبت‌نام فقط از نظر نمایش غیرفعال شده‌اند (کد اصلی حذف نشده است). برای فعال‌سازی مجدد:

1. به فایل‌های مربوط به صفحات `/pages/login.tsx` و `/pages/register.tsx` مراجعه کنید.
2. بخش نمایش پیام "غیرفعال است" را حذف یا کامنت کنید.
3. فرم و منطق اصلی را مجدداً فعال کنید (کدها همچنان در همان فایل‌ها موجود است).
4. در صورت نیاز، لینک‌ها و سایر بخش‌های مرتبط با احراز هویت را نیز از حالت مخفی خارج کنید.

هیچ داده یا کدی حذف نشده و همه چیز قابل بازگشت است.

## 🔐 راهنمای ورود به پنل ادمین

### مرحله 1: ایجاد کاربر ادمین اولیه
برای اولین بار، یک کاربر ادمین ایجاد کنید:

```bash
curl -X POST http://localhost:3000/api/setup-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "مدیر سیستم",
    "email": "admin@qiet.ac.ir",
    "password": "Admin123!",
    "secretKey": "qiet-admin-2024"
  }'
```

### مرحله 2: ورود به پنل ادمین
1. به آدرس `/admin-login` بروید
2. ایمیل و رمز عبور ادمین را وارد کنید
3. پس از ورود موفق، به پنل ادمین هدایت می‌شوید

### نکات امنیتی:
- صفحه `/admin-login` از موتورهای جستجو مخفی است
- فقط کاربران با نقش `ADMIN` می‌توانند به پنل دسترسی داشته باشند
- فرم‌های اصلی لاگین و ثبت‌نام همچنان غیرفعال هستند
- کلید امنیتی پیش‌فرض: `qiet-admin-2024` (قابل تغییر در متغیر محیطی `ADMIN_SETUP_SECRET`) 

---

### کدهای نمایش فعلی صفحات لاگین و ثبت‌نام (غیرفعال شده)

#### src/pages/login.tsx

```tsx
// ... کد کامل صفحه لاگین (Login) که فقط نمایش آن غیرفعال شده است
// برای فعال‌سازی مجدد، کافی است پیام غیرفعال بودن را حذف و فرم زیر را نمایش دهید:

// ...
// (کد کامل صفحه Login در فایل src/pages/login.tsx موجود است)
```

#### src/pages/register.tsx

```tsx
// ... کد کامل صفحه ثبت‌نام (Register) که فقط نمایش آن غیرفعال شده است
// برای فعال‌سازی مجدد، کافی است پیام غیرفعال بودن را حذف و فرم زیر را نمایش دهید:

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { 
  TextField, 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Grid,
  Divider,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SchoolIcon from '@mui/icons-material/School';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const registerSchema = z.object({
  name: z.string()
    .min(2, 'نام باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام نمی‌تواند بیشتر از 50 کاراکتر باشد'),
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string()
    .min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'رمز عبور باید شامل حروف بزرگ، کوچک و اعداد باشد'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمز عبور و تکرار آن مطابقت ندارند',
  path: ['confirmPassword']
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);

    try {
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'خطا در ثبت نام');
      }

      // Sign in the user after successful registration
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      toast.success('ثبت نام با موفقیت انجام شد');
      router.push('/dashboard');
    } catch (error) {
        toast.error(error instanceof Error ? error.message : 'خطا در ثبت نام');
    } finally {
      setLoading(false);
    }
  };

  // ... (ادامه کد مربوط به فرم و نمایش)
};

export default Register;
```

// برای مشاهده کد کامل، به فایل‌های src/pages/login.tsx و src/pages/register.tsx مراجعه کنید. 