import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

type RegisterResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API Route: /api/auth/register');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' }
    });
  }

  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      console.log('Validation failed:', { name, email, password });
      return res.status(400).json({
        success: false,
        error: { message: 'تمام فیلدها الزامی هستند', code: 'INVALID_INPUT' }
      });
    }

    // Check if user exists
    console.log('Checking for existing user with email:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        error: { message: 'این ایمیل قبلاً ثبت شده است', code: 'EMAIL_EXISTS' }
      });
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await hash(password, 10);

    // Create user
    console.log('Creating new user...');
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER'
      }
    });

    console.log('User created successfully:', user.id);

    // Generate token
    const token = sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data and token
    const responseData: RegisterResponse = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

    return res.status(201).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطا در ثبت‌نام', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 