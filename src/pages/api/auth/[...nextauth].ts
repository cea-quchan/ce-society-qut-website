import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from "@/lib/prisma";
import { compare } from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "ایمیل", type: "email" },
        password: { label: "رمز عبور", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('لطفا ایمیل و رمز عبور را وارد کنید');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          throw new Error('کاربری با این ایمیل یافت نشد');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('رمز عبور اشتباه است');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role as 'ADMIN' | 'USER'
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || ''
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (!session?.user?.email) return session;
      if ((token as any).deleted) {
        // User deleted, force sign out
        return { ...session, user: undefined };
      }
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (!user) {
        // User deleted, mark session for sign out
        return { ...session, user: undefined };
      }
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
    async jwt({ token }) {
      if (!token?.email) return token;
      const user = await prisma.user.findUnique({ where: { email: token.email as string } });
      if (!user) {
        // User deleted, mark token
        return { ...token, deleted: true };
      }
      return token;
    },
  }
};

export default NextAuth(authOptions); 