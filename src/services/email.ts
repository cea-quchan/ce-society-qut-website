import nodemailer from 'nodemailer';
import { AppError } from '@/middleware/error';

export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface PaymentDetails {
  amount: number;
  type: string;
  date: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  static async sendEmail(data: EmailData) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html
      });

      return info;
    } catch {
      throw new AppError('خطا در ارسال ایمیل', 500);
    }
  }

  static async sendWelcomeEmail(email: string, name: string) {
    const subject = 'به پلتفرم آموزشی ما خوش آمدید';
    const html = `
      <h1>سلام ${name} عزیز</h1>
      <p>به پلتفرم آموزشی ما خوش آمدید. امیدواریم که از خدمات ما راضی باشید.</p>
      <p>برای شروع، می‌توانید به دوره‌های آموزشی ما نگاهی بیندازید.</p>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  static async sendPasswordResetEmail(email: string, resetToken: string) {
    const subject = 'بازنشانی رمز عبور';
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    const html = `
      <h1>بازنشانی رمز عبور</h1>
      <p>برای بازنشانی رمز عبور خود، روی لینک زیر کلیک کنید:</p>
      <a href="${resetUrl}">بازنشانی رمز عبور</a>
      <p>این لینک تا 1 ساعت معتبر است.</p>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  static async sendCourseEnrollmentEmail(email: string, name: string, courseTitle: string) {
    const subject = 'ثبت‌نام موفق در دوره';
    const html = `
      <h1>سلام ${name} عزیز</h1>
      <p>ثبت‌نام شما در دوره "${courseTitle}" با موفقیت انجام شد.</p>
      <p>می‌توانید از طریق پنل کاربری خود به محتوای دوره دسترسی داشته باشید.</p>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html
    });
  }

  static async sendPaymentConfirmationEmail(email: string, paymentDetails: PaymentDetails) {
    const subject = 'تایید پرداخت';
    const html = `
      <h1>پرداخت شما با موفقیت انجام شد</h1>
      <p>جزئیات پرداخت:</p>
      <ul>
        <li>مبلغ: ${paymentDetails.amount}</li>
        <li>نوع: ${paymentDetails.type}</li>
        <li>تاریخ: ${paymentDetails.date}</li>
      </ul>
    `;

    await this.sendEmail({ to: email, subject, html });
  }
} 