import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Customer from "@/models/Customer";

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
        const user = await Customer.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with this email");
        }
        if (!user.password) {
          throw new Error("Please sign in with Google or create a password by signing up.");
        }
        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image
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
            // Guest -> Account linking OR returning Google user
            existingUser.googleId = account.providerAccountId;
            existingUser.name = existingUser.name || user.name;
            existingUser.image = existingUser.image || user.image;
            await existingUser.save();
            user.id = existingUser._id.toString();
          } else {
            // New Google User
            const newUser = await Customer.create({
              email: user.email,
              name: user.name,
              googleId: account.providerAccountId,
              image: user.image,
            });
            user.id = newUser._id.toString();
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
