import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";
import { logEvent } from "@/lib/logger";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        await connectDB();

        const reqEmail = credentials.email.trim().toLowerCase();
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        // 1. Safe Admin Seeding (Only creates if admin does not exist)
        if (adminEmail && adminPassword && reqEmail === adminEmail) {
          let adminUser = await Customer.findOne({ email: reqEmail });
          if (!adminUser) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await Customer.create({
              name: "Store Admin",
              email: adminEmail,
              password: hashedPassword,
              role: "admin",
              emailVerified: true // Admin is inherently verified
            });
          }
        }

        // 2. Normal Auth Flow (Includes Admin after seeding)
        const user = await Customer.findOne({ email: reqEmail });
        
        if (!user) {
          throw new Error("No user found with this email");
        }
        
        if (user.lockUntil && user.lockUntil > new Date()) {
          throw new Error("Account temporarily locked due to too many failed attempts. Please try again later.");
        }
        
        if (!user.password) {
          throw new Error("Please sign in with Google or create a password by signing up.");
        }
        
        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        
        if (!isPasswordCorrect) {
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
          if (user.failedLoginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // lock for 15 mins
            logEvent("security", "account_locked", { email: reqEmail });
          }
          await user.save();
          logEvent("warning", "login_failed", { email: reqEmail, attempts: user.failedLoginAttempts });
          throw new Error("Invalid credentials");
        }
        
        if (process.env.NODE_ENV === 'production' && user.emailVerified === false) {
          throw new Error("Please verify your email before logging in.");
        }
        
        // Successful login: reset counters
        if (user.failedLoginAttempts > 0 || user.lockUntil) {
          user.failedLoginAttempts = 0;
          user.lockUntil = undefined;
          await user.save();
        }

        logEvent("info", "login_success", { 
          userId: user._id.toString(), 
          email: user.email, 
          role: user.role 
        });

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role || "customer"
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectDB();
        try {
          const existingUser = await Customer.findOne({ email: user.email });
          if (existingUser) {
            existingUser.googleId = account.providerAccountId;
            existingUser.name = existingUser.name || user.name;
            existingUser.image = existingUser.image || user.image;
            await existingUser.save();
            user.id = existingUser._id.toString();
            (user as any).role = existingUser.role || "customer";
          } else {
            const newUser = await Customer.create({
              email: user.email,
              name: user.name,
              googleId: account.providerAccountId,
              image: user.image,
              role: "customer",
              emailVerified: true // Google implicitly verifies email
            });
            user.id = newUser._id.toString();
            (user as any).role = "customer";
          }
          return true;
        } catch (error) {
          console.error("Error linking Google account:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        // JWT Role: token.role
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        // Session Role: session.user.role
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (reduced from 30)
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  secret: process.env.NEXTAUTH_SECRET,
};

import { checkRateLimit } from "@/lib/rate-limit";

const handler = NextAuth(authOptions);

export async function POST(req: Request, ctx: any) {
  // Login rate limiting: 5 attempts / 15 minutes
  const rlResponse = await checkRateLimit(req, "login", 5, 15);
  if (rlResponse) return rlResponse;

  return handler(req, ctx);
}

export { handler as GET };
